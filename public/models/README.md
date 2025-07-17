# Nexie 3D Model Setup

## Quick Setup:

1. **Place your nexie.glb file** in this directory (`public/models/nexie.glb`)
2. **The FloatingNexie component** will automatically load it
3. **The character will appear** in the bottom-right corner like a chatbox

## Features:

✅ **Bottom-right floating position** - Like a chat assistant
✅ **Mouse cursor following** - Nexie looks at your mouse
✅ **Step-based messages** - Different messages for each step
✅ **Minimize/Expand** - Click the minimize button to make it smaller
✅ **Speech bubbles** - Toggle message visibility
✅ **Smooth animations** - Floating and breathing effects
✅ **Arabic text support** - All messages in Arabic
✅ **Performance optimized** - Auto-detects low-end devices

## Usage:

The FloatingNexie component is now integrated into:
- **Stepper page** (`/stepper`) - Shows steps 1-6
- **Review page** (`/stepper/review`) - Shows step 7

## File Structure:
```
public/
  models/
    nexie.glb          <- Place your 3D model here
    README.md          <- This file
```

## Messages for each step:

1. **Step 1**: "مرحباً! أنا نكسي 😊 دعني أساعدك في اختيار الشعبة"
2. **Step 2**: "أدخل نقاطك بعناية فهي مهمة جداً لحساب إمكانياتك"
3. **Step 3**: "تاريخ الميلاد يساعدني في التوجيه الأفضل"
4. **Step 4**: "هذه المعلومة مهمة للتوجيه الصحيح"
5. **Step 5**: "الولاية تساعد في معرفة الجامعات القريبة منك"
6. **Step 6**: "اختر الدورة المناسبة لظروفك"
7. **Step 7**: "راجع بياناتك بعناية وسأحسب أفضل الخيارات لك"

## Controls:

- **💬 Button**: Toggle speech bubble
- **➖ Button**: Minimize/Expand character
- **Auto-hide**: Speech bubble disappears after 5 seconds
- **Step change**: New message appears automatically

Just place your `nexie.glb` file in this folder and it will work automatically!
