// Test message serialization functionality
console.log('Testing message serialization...');

// Mock message objects that might cause serialization issues
const testMessages = [
  {
    id: '1',
    role: 'user',
    content: 'Simple string message'
  },
  {
    id: '2',
    role: 'assistant',
    content: { text: 'Object message', type: 'complex' }
  },
  {
    id: '3',
    role: 'user',
    content: null
  },
  {
    id: '4',
    role: 'assistant',
    content: undefined
  },
  {
    id: '5',
    role: 'user',
    content: 123
  },
  {
    id: '6',
    role: 'assistant',
    content: ['array', 'content']
  }
];

// Test the cleaning function
function cleanMessage(msg) {
  return {
    id: msg.id || Date.now().toString(),
    role: msg.role || 'assistant',
    content: typeof msg.content === 'string' ? msg.content : 
             typeof msg.content === 'object' && msg.content !== null ? JSON.stringify(msg.content) : 
             String(msg.content || ''),
    createdAt: msg.createdAt || new Date().toISOString()
  };
}

console.log('Original messages:', testMessages);

const cleanedMessages = testMessages.map(cleanMessage);
console.log('Cleaned messages:', cleanedMessages);

// Test serialization
try {
  const serialized = JSON.stringify(cleanedMessages);
  console.log('Serialization successful!');
  console.log('Serialized length:', serialized.length);
  
  // Test deserialization
  const deserialized = JSON.parse(serialized);
  console.log('Deserialization successful!');
  console.log('Deserialized messages:', deserialized);
  
  // Check for any [object Object] in the content
  const hasObjectStrings = deserialized.some(msg => msg.content.includes('[object Object]'));
  console.log('Contains [object Object]:', hasObjectStrings);
  
} catch (error) {
  console.error('Serialization failed:', error);
}

console.log('Test completed!');
