# 13. Nexie 3D Assistant - Assistant Virtuel Immersif

## 🎭 Vue d'ensemble de Nexie

**Nexie** (نكسي) est notre assistant virtuel 3D révolutionnaire qui transforme l'expérience d'orientation universitaire en interaction immersive. Utilisant React Three Fiber et des animations avancées, Nexie guide les étudiants tunisiens avec une présence visuelle engageante et des réponses contextuelles intelligentes.

### Caractéristiques Principales
- **Modèle 3D animé** avec expressions faciales et gestures
- **Interactions contextuelles** adaptées à chaque page
- **Messages dynamiques** selon progression utilisateur
- **Performance optimisée** pour tous types d'appareils
- **Intégration chat** seamless avec IA conversationnelle

## 🎨 Design et Animation

### 1. Modèle 3D Nexie

```javascript
// src/components/FloatingNexie.jsx - Composant principal
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, PresentationControls, Float } from '@react-three/drei';

function NexieModel({ scale = 1, position = [0, 0, 0] }) {
  const { scene } = useGLTF('/models/nexie.glb');
  const meshRef = useRef();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Animation regard vers curseur
  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePosition({
        x: (event.clientX / window.innerWidth) * 2 - 1,
        y: -(event.clientY / window.innerHeight) * 2 + 1
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animation continue (respiration, regard)
  useFrame((state) => {
    if (meshRef.current) {
      // Rotation vers curseur
      meshRef.current.rotation.y = mousePosition.x * 0.1;
      meshRef.current.rotation.x = mousePosition.y * 0.05;
      
      // Animation respiration
      const breathing = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      meshRef.current.scale.y = scale + breathing;
    }
  });

  return (
    <primitive 
      ref={meshRef}
      object={scene}
      scale={[scale, scale, scale]}
      position={position}
    />
  );
}
```

### 2. Système d'Animations Avancées

```javascript
// Animations contextuelles selon état
const ANIMATION_STATES = {
  idle: {
    duration: 4000,
    keyframes: [
      { rotation: [0, 0, 0], scale: 1 },
      { rotation: [0.02, 0.01, 0], scale: 1.02 },
      { rotation: [0, 0, 0], scale: 1 }
    ]
  },
  speaking: {
    duration: 800,
    keyframes: [
      { scale: 1, position: [0, 0, 0] },
      { scale: 1.05, position: [0, 0.1, 0] },
      { scale: 1, position: [0, 0, 0] }
    ]
  },
  listening: {
    duration: 2000,
    keyframes: [
      { rotation: [0, -0.1, 0] },
      { rotation: [0, 0.1, 0] },
      { rotation: [0, 0, 0] }
    ]
  }
};

// Gestionnaire transitions fluides
function useAnimationController(currentState) {
  const [animationState, setAnimationState] = useState('idle');
  
  useEffect(() => {
    const animation = ANIMATION_STATES[currentState];
    if (animation) {
      setAnimationState(currentState);
      // Auto-retour idle après animation
      setTimeout(() => setAnimationState('idle'), animation.duration);
    }
  }, [currentState]);
  
  return animationState;
}
```

## 🎯 Messages Contextuels Intelligents

### 1. Système de Messages Adaptatifs

```javascript
// Messages spécialisés par page et étape
const CONTEXTUAL_MESSAGES = {
  '/stepper': {
    1: [
      "مرحباً! أنا نكسي 😊 دعني أساعدك في اختيار الشعبة",
      "أهلاً بك! سأكون رفيقك في رحلة اختيار التوجه الجامعي",
      "مرحباً! معاً سنجد أفضل توجه جامعي لك ✨"
    ],
    2: [
      "أدخل نقاطك بعناية فهي مهمة جداً لحساب إمكانياتك",
      "النقاط الدقيقة تساعدني في تقديم نصائح أفضل",
      "كلما كانت المعلومات دقيقة، كانت التوصيات أفضل 🎯"
    ],
    3: [
      "تاريخ الميلاد يساعدني في التوجيه الأفضل",
      "هذه المعلومة مهمة لحساب المسار الأكاديمي المناسب",
      "معرفة عمرك تساعد في التخطيط الزمني للدراسة 📅"
    ]
    // ... messages pour chaque étape
  },
  
  '/orientations': [
    "تصفح الاختصاصات واكتشف ما يناسب موهبتك",
    "كل اختصاص له مميزاته، اكتشف الأنسب لك",
    "ساعدك في فهم تفاصيل كل توجه جامعي 🔍"
  ],
  
  '/comparison': [
    "ممتاز! الآن سأحلل الخيارين وأعطيك أفضل المقارنات",
    "دعني أدرس المقارنة وأقدم لك تحليلاً شاملاً",
    "سأقارن بين الخيارين بناءً على ملفك الشخصي 📊"
  ]
};

// Sélection message intelligent
function getContextualMessage(pathname, currentStep = null) {
  const messages = CONTEXTUAL_MESSAGES[pathname];
  
  if (!messages) {
    return "مرحباً! كيف يمكنني مساعدتك اليوم؟ 😊";
  }
  
  // Messages spécifiques par étape
  if (currentStep && messages[currentStep]) {
    const stepMessages = messages[currentStep];
    return stepMessages[Math.floor(Math.random() * stepMessages.length)];
  }
  
  // Messages généraux pour la page
  if (Array.isArray(messages)) {
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  return messages[Object.keys(messages)[0]][0];
}
```

### 2. Intégration Chat Contextuel

```javascript
// Connexion entre Nexie 3D et Chat IA
function FloatingNexie() {
  const [showChat, setShowChat] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const { pathname } = useRouter();
  const { currentStep } = useStepperContext();

  // Mise à jour message selon contexte
  useEffect(() => {
    const message = getContextualMessage(pathname, currentStep);
    setCurrentMessage(message);
    
    // Animation parlante quand nouveau message
    triggerSpeakingAnimation();
  }, [pathname, currentStep]);

  // Toggle chat avec transition fluide
  const handleChatToggle = () => {
    setShowChat(!showChat);
    // Animation Nexie pendant transition
    triggerAnimationState(showChat ? 'goodbye' : 'greeting');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Modèle 3D Nexie */}
      <div className="relative">
        <Canvas
          style={{ width: '120px', height: '120px' }}
          camera={{ position: [0, 0, 5], fov: 50 }}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} />
          <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
            <NexieModel scale={0.8} />
          </Float>
        </Canvas>
        
        {/* Bulle de message */}
        <SpeechBubble 
          message={currentMessage}
          visible={!showChat}
          onClose={() => setCurrentMessage('')}
        />
        
        {/* Bouton interaction */}
        <button
          onClick={handleChatToggle}
          className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-600 
                     text-white rounded-full w-8 h-8 flex items-center justify-center
                     transition-all duration-200 shadow-lg"
        >
          {showChat ? <X size={16} /> : <MessageCircle size={16} />}
        </button>
      </div>

      {/* Chat Interface */}
      {showChat && (
        <div className="absolute bottom-full right-0 mb-4">
          <ChatBotEnhanced
            isOpen={showChat}
            onToggle={handleChatToggle}
            mode="widget"
            initialContext={{
              page: pathname,
              step: currentStep,
              nexieMessage: currentMessage
            }}
          />
        </div>
      )}
    </div>
  );
}
```

## ⚡ Optimisations Performance

### 1. Détection Capacités Appareil

```javascript
// Adaptation automatique selon performance
function usePerformanceOptimization() {
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    isLowEnd: false,
    supportsWebGL2: false,
    preferredQuality: 'high'
  });

  useEffect(() => {
    // Détection GPU et performance
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = debugInfo ? 
        gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
      
      // Détection appareils faibles
      const isLowEnd = /mobile|android|iphone|ipad/i.test(navigator.userAgent) ||
                      navigator.hardwareConcurrency < 4 ||
                      renderer.includes('Adreno 5') ||
                      renderer.includes('Mali-G');
      
      setDeviceCapabilities({
        isLowEnd,
        supportsWebGL2: !!canvas.getContext('webgl2'),
        preferredQuality: isLowEnd ? 'low' : 'high'
      });
    }
  }, []);

  return deviceCapabilities;
}

// Configuration adaptative qualité
function AdaptiveNexieModel() {
  const { preferredQuality, isLowEnd } = usePerformanceOptimization();
  
  const qualitySettings = {
    low: {
      scale: 0.6,
      animationFramerate: 30,
      shadowQuality: 'off',
      textureResolution: 512
    },
    high: {
      scale: 1.0,
      animationFramerate: 60,
      shadowQuality: 'high',
      textureResolution: 1024
    }
  };

  const settings = qualitySettings[preferredQuality];

  return (
    <Canvas
      gl={{ 
        antialias: !isLowEnd,
        alpha: true,
        powerPreference: isLowEnd ? 'low-power' : 'high-performance'
      }}
      frameloop="demand" // Rendu à la demande pour économie
    >
      <NexieModel 
        scale={settings.scale}
        quality={preferredQuality}
      />
    </Canvas>
  );
}
```

### 2. Lazy Loading et Preloading

```javascript
// Chargement optimisé modèle 3D
import { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';

// Preload model pour performance
useGLTF.preload('/models/nexie.glb');

function FloatingNexieWrapper() {
  return (
    <Suspense fallback={<NexieLoadingSpinner />}>
      <FloatingNexie />
    </Suspense>
  );
}

// Spinner de chargement élégant
function NexieLoadingSpinner() {
  return (
    <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 
                    rounded-full flex items-center justify-center animate-pulse">
      <div className="w-12 h-12 bg-white rounded-full opacity-80 animate-bounce" />
    </div>
  );
}
```

## 🌍 Accessibilité et Inclusion

### 1. Support Multilingue

```javascript
// Messages adaptatifs langue utilisateur
function useLocalizedMessages() {
  const { language } = useI18n();
  
  const messages = {
    ar: {
      greeting: "مرحباً! أنا نكسي، مساعدك الذكي 😊",
      help: "كيف يمكنني مساعدتك اليوم؟",
      guidance: "دعني أرشدك خطوة بخطوة"
    },
    fr: {
      greeting: "Bonjour ! Je suis Nexie, votre assistant intelligent 😊",
      help: "Comment puis-je vous aider aujourd'hui ?",
      guidance: "Laissez-moi vous guider étape par étape"
    }
  };
  
  return messages[language] || messages.ar;
}
```

### 2. Alternatives Accessibles

```javascript
// Support screen readers et navigation clavier
function AccessibleNexie() {
  return (
    <div 
      role="complementary"
      aria-label="Assistant virtuel Nexie"
      tabIndex={0}
    >
      {/* Modèle 3D avec description */}
      <div aria-hidden="true">
        <NexieModel />
      </div>
      
      {/* Alternative textuelle */}
      <div className="sr-only">
        Assistant virtuel Nexie disponible pour vous aider dans votre orientation.
        Appuyez sur Entrée pour ouvrir le chat.
      </div>
      
      {/* Contrôles accessibles */}
      <button
        aria-label="Ouvrir chat avec Nexie"
        onKeyDown={(e) => e.key === 'Enter' && openChat()}
      >
        💬 Chat
      </button>
    </div>
  );
}
```

## 📊 Analytics et Métriques

### 1. Tracking Interactions Nexie

```javascript
// Mesure engagement utilisateur avec Nexie
function useNexieAnalytics() {
  const trackInteraction = useCallback((action, context) => {
    analytics.track('nexie_interaction', {
      action,           // 'message_view', 'chat_open', 'animation_trigger'
      context,          // page actuelle, étape, type message
      timestamp: Date.now(),
      device: getDeviceInfo(),
      performance: getPerformanceMetrics()
    });
  }, []);

  return { trackInteraction };
}

// Métriques performance 3D
function getPerformanceMetrics() {
  return {
    fps: Math.round(1000 / performance.now()),
    loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
    memoryUsage: performance.memory?.usedJSHeapSize || 0
  };
}
```

## 🔮 Évolutions Futures

### Roadmap Nexie 2024-2025

#### Phase 2: Intelligence Émotionnelle
- **Reconnaissance émotions** via analyse texte utilisateur
- **Expressions faciales** adaptées contexte émotionnel
- **Réponses empathiques** selon état psychologique

#### Phase 3: Réalité Augmentée
- **AR mode** sur mobile avec caméra
- **Interactions gestuelles** reconnaissance mouvement
- **Environnements 3D** bureaux virtuels orientation

#### Phase 4: Personnalisation Avancée
- **Avatars personnalisables** apparence utilisateur
- **Voix synthétique** arabe tunisien naturel
- **IA comportementale** adaptation personnalité Nexie

#### Phase 5: Écosystème Étendu
- **API Nexie** intégration sites tiers
- **SDK développeurs** création assistants similaires
- **Marketplace expressions** animations communautaires
