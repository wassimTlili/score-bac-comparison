'use client';
import React, { Suspense, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, ContactShadows } from '@react-three/drei';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useFloatingNexie } from '@/context/FloatingNexieContext';
import { debugLog, debugError } from '@/utils/debug';
import ChatErrorBoundary from './ChatErrorBoundary';

// Dynamic import for ChatBotEnhanced to avoid SSR issues
const ChatBotEnhanced = dynamic(() => import('./ChatBotEnhanced'), {
  ssr: false,
  loading: () => null
});

// Loading Spinner
function LoadingSpinner() {
  return (
    <div className="fixed bottom-4 right-4 z-[60] pointer-events-none">
      <div className="w-20 h-20 bg-slate-800/90 rounded-2xl flex items-center justify-center shadow-lg">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
}

// Context-aware message system
function getContextualMessage(pathname, currentStep) {
  const contextMessages = {
    // Home page messages
    '/': [
      "مرحباً! كيف يمكنني مساعدتك اليوم؟",
      "أهلاً وسهلاً! انا هنا لمساعدتك",
      "مرحبا بك في NextGen! كيف يمكنني خدمتك؟"
    ],
    // Stepper pages with step-specific guidance
    '/stepper': [
      "أحتاج مساعدة في ملء النموذج",
      "كيف أملأ معلومات الشعبة؟",
      "ساعدني في إدخال النقاط",
      "كيف أختار الولاية والمدينة؟"
    ],
    // Comparison page
    '/comparison': [
      "ساعدني في مقارنة الخيارات",
      "اشرح لي المقارنة",
      "أي توجه الأفضل لي؟",
      "كيف أفسر النتائج؟"
    ],
    // Results page
    '/results': [
      "اشرح لي النتائج",
      "كيف احسن من نقاطي؟",
      "ما هي أفضل التوجهات لي؟",
      "كيف أفهم النتيجة؟"
    ],
    // Orientations page
    '/orientations': [
      "ساعدني في اختيار التوجه",
      "ما هي أفضل الخيارات لي؟",
      "كيف أقرر توجهي الجامعي؟",
      "اشرح لي الاختصاصات"
    ],
    // Recommendations page
    '/recommendations': [
      "ما هي التوصيات المناسبة لي؟",
      "كيف أحسن من فرصي؟",
      "ساعدني في اختيار الجامعة",
      "أي اختصاص ينصح لي؟"
    ],
    // Chat page
    '/chatbot': [
      "كيف يمكنني مساعدتك؟",
      "هل تريد مساعدة في شيء معين؟",
      "أسأل عن أي شيء تريد معرفته",
      "أنا جاهز للإجابة على أسئلتك"
    ],
    // Guide page
    '/guide': [
      "دليل استخدام المنصة",
      "كيف أستخدم الأدوات؟",
      "ساعدني في فهم الخطوات",
      "أريد تعلم كيفية الاستخدام"
    ],
    // Calcul page
    '/calcul': [
      "ساعدني في حساب المعدل",
      "كيف أحسب نقاط الباك؟",
      "اشرح لي طريقة الحساب",
      "أريد حساب معدلي"
    ]
  };

  // Special handling for stepper with currentStep
  if (pathname === '/stepper' && currentStep) {
    const stepMessages = {
      1: [
        "أحتاج مساعدة في اختيار الشعبة", 
        "كيف أختار شعبة البكالوريا؟",
        "ما هي أفضل شعبة لي؟",
        "ساعدني في فهم الشعب"
      ],
      2: [
        "ساعدني في إدخال النقاط", 
        "كيف أدخل نقاط المواد؟",
        "كيف أحسب معدلي؟",
        "ما هي النقاط المطلوبة؟"
      ],
      3: [
        "كيف أختار الولاية والمدينة؟", 
        "ساعدني في اختيار الموقع",
        "ما هي أفضل الجامعات؟",
        "كيف أحدد موقعي المفضل؟"
      ],
      4: [
        "اشرح لي الخيارات المتاحة", 
        "كيف أراجع بياناتي؟",
        "هل المعلومات صحيحة؟",
        "ما هي الخطوة التالية؟"
      ],
      5: [
        "ما هي النتائج المتوقعة؟", 
        "كيف أفسر التوقعات؟",
        "ما هي فرصي في القبول؟",
        "ساعدني في فهم النتائج"
      ]
    };
    const messages = stepMessages[currentStep] || contextMessages['/stepper'];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // Get messages for current path
  const pathMessages = contextMessages[pathname] || contextMessages['/'];
  
  // Return random message from the array
  return pathMessages[Math.floor(Math.random() * pathMessages.length)];
}

// Error Boundary for 3D Model
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Model Error:', error, errorInfo);
    debugError('ErrorBoundary', 'Component error caught:', { error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-lg cursor-pointer flex items-center justify-center">
          <div className="w-10 h-10 bg-white rounded-full animate-bounce"></div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced Nexie 3D Model Component - Preserving original colors and better positioning
function NexieModel({ onLoad }) {
  const meshRef = useRef();
  const { scene, error } = useGLTF('/models/nexie.glb');
  
  // Memoize the loaded state to prevent unnecessary re-renders
  const isLoaded = useMemo(() => !!scene, [scene]);
  
  useEffect(() => {
    if (isLoaded && onLoad) {
      debugLog('NexieModel', '3D Model loaded successfully');
      onLoad();
    }
    if (error) {
      debugError('NexieModel', 'Error loading 3D model:', error);
    }
  }, [isLoaded, onLoad, error]);

  // Preserve original materials and colors
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          // Don't clone or modify the material to preserve original colors
          // Just ensure the material properties are optimal for rendering
          if (child.material.metalness !== undefined) {
            child.material.metalness = 0.1; // Slight metalness for better appearance
          }
          if (child.material.roughness !== undefined) {
            child.material.roughness = 0.8; // Keep it slightly rough for better lighting
          }
          // Keep original colors intact - don't modify color properties
        }
      });
    }
  }, [scene]);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Gentle floating animation
      const floatY = Math.sin(time * 1.2) * 0.08;
      meshRef.current.position.y = -1.2 + floatY; // Positioned lower in the container
      
      // Keep model facing forward
      meshRef.current.rotation.x = 0;
      meshRef.current.rotation.y = Math.PI; // Face forward
      meshRef.current.rotation.z = 0;
      
      // Subtle breathing/pulse effect
      const breathingScale = 1 + Math.sin(time * 1.8) * 0.02;
      meshRef.current.scale.set(breathingScale, breathingScale, breathingScale);
    }
  });

  if (error) {
    debugError('NexieModel', 'GLB loading error:', error);
    return (
      <mesh ref={meshRef} position={[0, -1.2, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#22d3ee" />
      </mesh>
    );
  }

  if (!isLoaded) {
    debugLog('NexieModel', 'Scene not loaded yet');
    return null;
  }

  return (
    <primitive 
      ref={meshRef}
      object={scene} 
      scale={2.8} // Adjusted scale for better fit
      position={[1.7, -1.2, 0]} // Positioned lower in the container
    />
  );
}

// Preload the GLB model
useGLTF.preload('/models/nexie.glb');

// Main FloatingNexie Component
export default function FloatingNexie({ 
  currentStep, 
  onMessageClick, 
  showChatPrompt = false,
  onChatOpen 
}) {
  const pathname = usePathname();
  const { shouldShowOnCurrentPath, requestActivation, releaseActivation, persistentConversationId } = useFloatingNexie();
  
  // State management with performance optimizations
  const [isLoaded, setIsLoaded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [canRender, setCanRender] = useState(false);
  const [contextualMessage, setContextualMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  // Generate contextual message based on current path and step
  useEffect(() => {
    const message = getContextualMessage(pathname, currentStep);
    setContextualMessage(message);
  }, [pathname, currentStep]);

  // Load chat state from localStorage on mount
  useEffect(() => {
    const savedChatState = localStorage.getItem(`chatOpen_${pathname}`);
    if (savedChatState === 'true') {
      setIsChatOpen(true);
    }
  }, [pathname]);

  // Save chat state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`chatOpen_${pathname}`, isChatOpen.toString());
  }, [isChatOpen, pathname]);

  // Request activation when component mounts
  useEffect(() => {
    const startTime = performance.now();
    debugLog('FloatingNexie', 'useEffect triggered');
    debugLog('FloatingNexie', 'pathname', pathname);
    debugLog('FloatingNexie', 'shouldShowOnCurrentPath', shouldShowOnCurrentPath);
    
    if (shouldShowOnCurrentPath) {
      const canActivate = requestActivation(pathname);
      debugLog('FloatingNexie', 'canActivate', canActivate);
      setCanRender(canActivate);
    } else {
      debugLog('FloatingNexie', 'Should not show on current path');
      setCanRender(false);
    }
    
    const endTime = performance.now();
    debugLog('FloatingNexie', `useEffect execution time: ${endTime - startTime}ms`);
    
    return () => {
      debugLog('FloatingNexie', 'cleanup, releasing activation for', pathname);
      releaseActivation(pathname);
    };
  }, [pathname, shouldShowOnCurrentPath, requestActivation, releaseActivation]);

  // Optimized callback functions
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleChatToggle = useCallback(() => {
    debugLog('FloatingNexie', 'handleChatToggle called');
    const isComparisonPage = pathname.startsWith('/comparison');
    
    if (isComparisonPage) {
      debugLog('FloatingNexie', 'On comparison page - toggling side chat');
      setIsChatOpen(prev => {
        const newState = !prev;
        if (newState && onChatOpen) {
          onChatOpen();
        }
        return newState;
      });
    } else {
      debugLog('FloatingNexie', 'On other page - opening floating chat');
      setIsChatOpen(prev => {
        const newState = !prev;
        if (newState && onChatOpen) {
          onChatOpen();
        }
        return newState;
      });
    }
  }, [pathname, isChatOpen, onChatOpen]);

  const handleMessageClick = useCallback(() => {
    if (onMessageClick) {
      onMessageClick(contextualMessage);
    }
    handleChatToggle();
  }, [contextualMessage, onMessageClick, handleChatToggle]);

  // Don't render if we can't or shouldn't
  if (!shouldShowOnCurrentPath || !canRender) {
    debugLog('FloatingNexie', 'Not rendering', { shouldShowOnCurrentPath, canRender, pathname });
    return null;
  }

  debugLog('FloatingNexie', 'Rendering component on path:', pathname);

  const isComparisonPage = pathname.startsWith('/comparison');
  
  return (
    <>
      {/* Loading state */}
      {!isLoaded && <LoadingSpinner />}
      
      {/* Enhanced 3D Model container with better positioning */}
      <div className={`fixed bottom-4 right-4 z-[60] transition-all duration-700 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="relative group">
          <div 
            onClick={handleChatToggle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`w-20 h-20 cursor-pointer transform transition-all duration-300 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          >
            <ErrorBoundary>
              <Suspense fallback={<LoadingSpinner />}>
                <Canvas
                  camera={{ position: [0, 0, 4], fov: 50 }}
                  style={{ width: '80px', height: '80px' }}
                  gl={{ 
                    alpha: true, 
                    antialias: true,
                    powerPreference: 'high-performance',
                    preserveDrawingBuffer: true
                  }}
                  dpr={[1, 2]}
                >
                  {/* Enhanced lighting setup for better model visibility */}
                  <ambientLight intensity={0.8} color="#ffffff" />
                  <directionalLight position={[5, 5, 5]} intensity={0.6} color="#ffffff" />
                  <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#ffffff" />
                  <pointLight position={[0, 3, 3]} intensity={0.4} color="#ffffff" />
                  <pointLight position={[0, -3, 3]} intensity={0.2} color="#ffffff" />
                  
                  <NexieModel onLoad={handleLoad} />
                  
                  <ContactShadows 
                    opacity={0.15} 
                    scale={4} 
                    blur={2} 
                    far={4} 
                    resolution={256} 
                    color="#1e293b" 
                    position={[0, -1.5, 0]}
                  />
                </Canvas>
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Enhanced contextual chat prompt */}
          {showChatPrompt && (
            <div 
              className="absolute bottom-24 right-0 bg-slate-800/95 backdrop-blur-sm text-white px-4 py-3 rounded-xl shadow-xl animate-bounce cursor-pointer min-w-[200px] border border-slate-700/30"
              onClick={handleMessageClick}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                <span className="text-sm font-medium">{contextualMessage}</span>
              </div>
              <div className="absolute top-full right-8 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-800/95"></div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Chat Interface - Always use sidebar mode for consistency */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[70] pointer-events-none">
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto"
            onClick={handleChatToggle}
          />
          
          <ErrorBoundary>
            <div className="absolute right-0 top-0 h-full w-96 bg-slate-900 shadow-xl pointer-events-auto">
              <ChatErrorBoundary>
                <ChatBotEnhanced 
                  mode="sidebar"
                  onClose={handleChatToggle}
                  isOpen={true}
                  conversationId={persistentConversationId}
                  initialContext={{ 
                    page: pathname.slice(1) || 'home',
                    context: isComparisonPage ? 'comparison-analysis' : 'general-assistance',
                    contextualMessage: contextualMessage,
                    currentStep: currentStep
                  }}
                />
              </ChatErrorBoundary>
            </div>
          </ErrorBoundary>
        </div>
      )}
    </>
  );
}