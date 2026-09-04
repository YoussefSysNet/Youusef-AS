// Scroll Progress Bar Logic
window.addEventListener("scroll", () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;

  const progressBar = document.getElementById("scroll-indicator");
  progressBar.style.height = `${scrollPercent}%`;
});

// Loading animation
const letters = document.querySelectorAll(".loading-text span");

// Animate each letter with stagger
gsap.to(letters, {
  opacity: 1,
  duration: 1.2,
  stagger: 0.15,
  onUpdate: function () {
    letters.forEach((el, i) => {
      gsap.to(el, {
        color: "#ffffff",
        duration: 0.2,
        delay: i * 0.15,
      });
      gsap.to(el, {
        color: "rgba(255,255,255,0.1)",
        duration: 0.2,
        delay: i * 0.15 + 0.4,
      });
      gsap.to(el.querySelector("::after"), {
        opacity: 1,
        duration: 0.2,
        delay: i * 0.15,
      });
    });
  },
  onComplete: () => {
    gsap.to("#loading", {
      opacity: 0,
      duration: 1,
      delay: 0.5,
      onComplete: () => {
        document.getElementById("loading").style.display = "none";
      },
    });
  },
});


// Animation for Hero Text
gsap.from(".hero-left", {
  opacity: 0,
  x: -50,
  duration: 1.2,
  ease: "power3.out",
});

gsap.from(".hero-right", {
  opacity: 0,
  x: 50,
  duration: 1.2,
  ease: "power3.out",
  delay: 0.3,
});

gsap.utils.toArray(".journey-card").forEach((card, index) => {
  gsap.from(card, {
    opacity: 0,
    y: 80,
    duration: .4,
    ease: "power3.out",
    scrollTrigger: {
      trigger: card,
      start: "top 85%",
      toggleActions: "play none none reverse",
    },
    delay: index * 0.1,
  });
});

// HERO SECTION LINE WAVES BACKGROUND
function initLineWaves(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const {
    speed = 0.3,
    innerLineCount = 32.0,
    outerLineCount = 40.0,
    warpIntensity = 1.0,
    rotation = -23,
    edgeFadeWidth = 0.0,
    colorCycleSpeed = 1.0,
    brightness = 0.2,
    color1 = '#008CFF',
    color2 = '#008CFF',
    color3 = '#008CFF',
    enableMouseInteraction = true,
    mouseInfluence = 2.0
  } = options;

  function hexToVec3(hex) {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255
    ];
  }

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;';
  container.appendChild(canvas);

  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
  if (!gl) return;

  const vertexShaderSrc = `
    attribute vec2 aPosition;
    void main() {
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragmentShaderSrc = `
    precision highp float;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uSpeed;
    uniform float uInnerLines;
    uniform float uOuterLines;
    uniform float uWarpIntensity;
    uniform float uRotation;
    uniform float uEdgeFadeWidth;
    uniform float uColorCycleSpeed;
    uniform float uBrightness;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec2 uMouse;
    uniform float uMouseInfluence;
    uniform bool uEnableMouse;

    #define HALF_PI 1.5707963

    float hashF(float n) {
      return fract(sin(n * 127.1) * 43758.5453123);
    }

    float smoothNoise(float x) {
      float i = floor(x);
      float f = fract(x);
      float u = f * f * (3.0 - 2.0 * f);
      return mix(hashF(i), hashF(i + 1.0), u);
    }

    float displaceA(float coord, float t) {
      float result = sin(coord * 2.123) * 0.2;
      result += sin(coord * 3.234 + t * 4.345) * 0.1;
      result += sin(coord * 0.589 + t * 0.934) * 0.5;
      return result;
    }

    float displaceB(float coord, float t) {
      float result = sin(coord * 1.345) * 0.3;
      result += sin(coord * 2.734 + t * 3.345) * 0.2;
      result += sin(coord * 0.189 + t * 0.934) * 0.3;
      return result;
    }

    vec2 rotate2D(vec2 p, float angle) {
      float c = cos(angle);
      float s = sin(angle);
      return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
    }

    void main() {
      vec2 coords = gl_FragCoord.xy / uResolution;
      coords = coords * 2.0 - 1.0;
      coords.x *= uResolution.x / uResolution.y;
      coords = rotate2D(coords, uRotation);

      float halfT = uTime * uSpeed * 0.5;
      float fullT = uTime * uSpeed;

      float mouseWarp = 0.0;
      if (uEnableMouse) {
        vec2 mPos = rotate2D(uMouse * 2.0 - 1.0, uRotation);
        mPos.x *= uResolution.x / uResolution.y;
        float mDist = length(coords - mPos);
        mouseWarp = uMouseInfluence * exp(-mDist * mDist * 4.0);
      }

      float warpAx = coords.x + displaceA(coords.y, halfT) * uWarpIntensity + mouseWarp;
      float warpAy = coords.y - displaceA(coords.x * cos(fullT) * 1.235, halfT) * uWarpIntensity;
      float warpBx = coords.x + displaceB(coords.y, halfT) * uWarpIntensity + mouseWarp;
      float warpBy = coords.y - displaceB(coords.x * sin(fullT) * 1.235, halfT) * uWarpIntensity;

      vec2 fieldA = vec2(warpAx, warpAy);
      vec2 fieldB = vec2(warpBx, warpBy);
      vec2 blended = mix(fieldA, fieldB, mix(fieldA, fieldB, 0.5));

      float fadeTop = smoothstep(uEdgeFadeWidth, uEdgeFadeWidth + 0.4, blended.y);
      float fadeBottom = smoothstep(-uEdgeFadeWidth, -(uEdgeFadeWidth + 0.4), blended.y);
      float vMask = 1.0 - max(fadeTop, fadeBottom);

      float tileCount = mix(uOuterLines, uInnerLines, vMask);
      float scaledY = blended.y * tileCount;
      float nY = smoothNoise(abs(scaledY));

      float ridge = pow(
        step(abs(nY - blended.x) * 2.0, HALF_PI) * cos(2.0 * (nY - blended.x)),
        5.0
      );

      float lines = 0.0;
      for (float i = 1.0; i < 3.0; i += 1.0) {
        lines += pow(max(fract(scaledY), fract(-scaledY)), i * 2.0);
      }

      float pattern = vMask * lines;

      float cycleT = fullT * uColorCycleSpeed;
      float rChannel = (pattern + lines * ridge) * (cos(blended.y + cycleT * 0.234) * 0.5 + 1.0);
      float gChannel = (pattern + vMask * ridge) * (sin(blended.x + cycleT * 1.745) * 0.5 + 1.0);
      float bChannel = (pattern + lines * ridge) * (cos(blended.x + cycleT * 0.534) * 0.5 + 1.0);

      vec3 col = (rChannel * uColor1 + gChannel * uColor2 + bChannel * uColor3) * uBrightness;
      float alpha = clamp(length(col), 0.0, 1.0);

      gl_FragColor = vec4(col, alpha);
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vs = createShader(gl.VERTEX_SHADER, vertexShaderSrc);
  const fs = createShader(gl.FRAGMENT_SHADER, fragmentShaderSrc);
  if (!vs || !fs) return;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  // Fullscreen quad
  const quadVerts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);

  const aPosition = gl.getAttribLocation(program, 'aPosition');
  gl.enableVertexAttribArray(aPosition);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

  // Uniform locations
  const uTimeLoc = gl.getUniformLocation(program, 'uTime');
  const uResLoc = gl.getUniformLocation(program, 'uResolution');
  const uSpeedLoc = gl.getUniformLocation(program, 'uSpeed');
  const uInnerLoc = gl.getUniformLocation(program, 'uInnerLines');
  const uOuterLoc = gl.getUniformLocation(program, 'uOuterLines');
  const uWarpLoc = gl.getUniformLocation(program, 'uWarpIntensity');
  const uRotLoc = gl.getUniformLocation(program, 'uRotation');
  const uFadeLoc = gl.getUniformLocation(program, 'uEdgeFadeWidth');
  const uCycleLoc = gl.getUniformLocation(program, 'uColorCycleSpeed');
  const uBrightLoc = gl.getUniformLocation(program, 'uBrightness');
  const uC1Loc = gl.getUniformLocation(program, 'uColor1');
  const uC2Loc = gl.getUniformLocation(program, 'uColor2');
  const uC3Loc = gl.getUniformLocation(program, 'uColor3');
  const uMouseLoc = gl.getUniformLocation(program, 'uMouse');
  const uMouseInfLoc = gl.getUniformLocation(program, 'uMouseInfluence');
  const uEnableMouseLoc = gl.getUniformLocation(program, 'uEnableMouse');

  // Set static uniforms
  const rotRad = (rotation * Math.PI) / 180;
  gl.uniform1f(uSpeedLoc, speed);
  gl.uniform1f(uInnerLoc, innerLineCount);
  gl.uniform1f(uOuterLoc, outerLineCount);
  gl.uniform1f(uWarpLoc, warpIntensity);
  gl.uniform1f(uRotLoc, rotRad);
  gl.uniform1f(uFadeLoc, edgeFadeWidth);
  gl.uniform1f(uCycleLoc, colorCycleSpeed);
  gl.uniform1f(uBrightLoc, brightness);
  gl.uniform3fv(uC1Loc, hexToVec3(color1));
  gl.uniform3fv(uC2Loc, hexToVec3(color2));
  gl.uniform3fv(uC3Loc, hexToVec3(color3));
  gl.uniform1f(uMouseInfLoc, mouseInfluence);
  gl.uniform1i(uEnableMouseLoc, enableMouseInteraction ? 1 : 0);

  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let currentMouse = [0.5, 0.5];
  let targetMouse = [0.5, 0.5];

  function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    targetMouse = [
      (e.clientX - rect.left) / rect.width,
      1.0 - (e.clientY - rect.top) / rect.height
    ];
  }

  function handleMouseLeave() {
    targetMouse = [0.5, 0.5];
  }

  if (enableMouseInteraction) {
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
  }

  function resize() {
    const w = container.clientWidth || container.offsetWidth || window.innerWidth;
    const h = container.clientHeight || container.offsetHeight || window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uResLoc, w, h);
  }

  window.addEventListener('resize', resize);

  let animationFrameId;

  function render(time) {
    animationFrameId = requestAnimationFrame(render);
    gl.uniform1f(uTimeLoc, time * 0.001);

    if (enableMouseInteraction) {
      currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
      currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
      gl.uniform2f(uMouseLoc, currentMouse[0], currentMouse[1]);
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // Ensure layout is settled before first render
  requestAnimationFrame(() => {
    resize();
    animationFrameId = requestAnimationFrame(render);
  });

  return {
    destroy: () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      if (enableMouseInteraction) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    }
  };
}

initLineWaves('line-waves-container', {
  speed: 0.3,
  innerLineCount: 32,
  outerLineCount: 36,
  warpIntensity: 1.0,
  rotation: -45,
  brightness: 0.2,
  color1: '#008CFF',
  color2: '#008CFF',
  color3: '#008CFF',
  enableMouseInteraction: true,
  mouseInfluence: 2.0
});



particlesJS("particles-global", {
  "particles": {
    "number": { "value": 50 },
    "color": { "value": "008CFF" },
    "shape": { "type": "circle" },
    "opacity": {
      "value": 0.5,
      "random": true
    },
    "size": {
      "value": 4,
      "random": true
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "ffffff",
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 3,
      "direction": "none",
      "out_mode": "out"
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": { "enable": true, "mode": "grab" },
      "onclick": { "enable": true, "mode": "push" }
    },
    "modes": {
      "grab": {
        "distance": 140,
        "line_linked": { "opacity": 1 }
      },
      "push": { "particles_nb": 4 }
    }
  },
  "retina_detect": true
});


gsap.registerPlugin(ScrollTrigger);
  
gsap.utils.toArray('.fade-in').forEach((el) => {
  gsap.from(el, {
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
      toggleActions: "play none none none"
    },
    opacity: 0,
    y: 40,
    duration: 1.2,
    ease: "power3.out",
  });
});

gsap.from(".project-card", {
  scrollTrigger: {
    trigger: ".project-card",
    start: "top 85%",
    toggleActions: "play none none reset"
  },
  opacity: 0,
  y: 60,
  duration: 1,
  ease: "power3.out"
});
  
  gsap.from("#about-img", {
    scrollTrigger: {
      trigger: "#about-img",
      start: "top 80%",
      toggleActions: "play none none reset",
    },
    opacity: 0,
    x: -100,
    duration: .4,
    ease: "power3.out"
  });
  

  gsap.from("#about-text", {
    scrollTrigger: {
      trigger: "#about-text",
      start: "top 80%",
      toggleActions: "play none none reset",
    },
    opacity: 0,
    y: 50,
    duration: .4,
    ease: "power3.out",
    delay: 0.2
  });
  
  gsap.from("#techstack h2", {
    scrollTrigger: {
      trigger: "#techstack",
      start: "top 80%",
      toggleActions: "play none none reset"
    },
    opacity: 0,
    y: -40,
    duration: 1.2,
    ease: "power3.out"
  });
  
  gsap.utils.toArray("#techstack .group").forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        toggleActions: "play none none reset"
      },
      opacity: 0,
      y: 50,
      duration: 1,
      ease: "power3.out",
      delay: i * 0.1,
    });
  });

  gsap.utils.toArray('.tech-category').forEach((section, index) => {
    gsap.from(section, {
      opacity: 0,
      y: 60,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });
  });

  gsap.utils.toArray('.reveal-section').forEach(section => {
    gsap.from(section, {
      opacity: 0,
      y: 60,
      duration: 1,
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        toggleActions: "play none none reset"
      }
    });
  });

  // Up coming projects

  gsap.utils.toArray(".upcoming-card").forEach((card, i) => {
    gsap.from(card, {
      scrollTrigger: {
        trigger: "#upcoming-projects",
        start: "top 85%",
        toggleActions: "play none none reset"
      },
      opacity: 0,
      y: 60,
      duration: 1,
      ease: "power3.out",
      delay: i * 0.15,
    });
  });

  // Download Button Functionality
  document.addEventListener('DOMContentLoaded', function() {
    const downloadLink = document.querySelector('a[download]');
    
    if (downloadLink) {
      downloadLink.addEventListener('click', function(e) {
        // Let the default download behavior happen
      });
    }
  });
  
// Contact Form Functionality
document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const submitLoading = document.getElementById('submitLoading');
  const formMessage = document.getElementById('formMessage');
  const messageText = document.getElementById('messageText');
  const messageInput = document.getElementById('message');

  // Gibberish detection functions
  function detectGibberish(text) {
    const errors = [];
    
    // Remove extra whitespace and normalize
    const cleanText = text.trim().replace(/\s+/g, ' ');
    

    
    // 1. Check minimum length
    if (cleanText.length < 10) {
      errors.push('Message must be at least 10 characters long');
    }
    
    // 2. Check minimum word count
    const words = cleanText.split(' ').filter(word => word.length > 0);
    if (words.length < 3) {
      errors.push('Message must contain at least 3 words');
    }
    
    // 3. Check for excessive character repetition (e.g., "aaaaaa", "!!!!!!")
    const charRepetition = /(.)\1{4,}/g;
    if (charRepetition.test(cleanText)) {
      errors.push('Message contains too many repeated characters');
    }
    
    // 4. Check for excessive word repetition
    const wordCounts = {};
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 2) {
        wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
      }
    });
    
    const repeatedWords = Object.entries(wordCounts).filter(([word, count]) => count > 2);
    if (repeatedWords.length > 0) {
      errors.push('Message contains too many repeated words');
    }
    
    // 5. Check for random character sequences (e.g., "asdfgh", "qwerty")
    const randomPatterns = [
      /asdfgh/i, /qwerty/i, /zxcvbn/i, /123456/i, /abcdef/i,
      /[!@#$%^&*]{3,}/
    ];
    
    for (const pattern of randomPatterns) {
      if (pattern.test(cleanText)) {
        errors.push('Message contains random character sequences');
        break;
      }
    }
    
    // 5.5. Check for consecutive numbers (but allow normal text)
    const consecutiveNumbers = /[0-9]{4,}/;
    if (consecutiveNumbers.test(cleanText)) {
      errors.push('Message contains random number sequences');
    }
    
    // 6. Check for meaningful content (at least some words with 3+ characters)
    const meaningfulWords = words.filter(word => word.length >= 3);
    if (meaningfulWords.length < 2) {
      errors.push('Message must contain meaningful words (3+ characters)');
    }
    
    // 7. Check for excessive punctuation
    const punctuationCount = (cleanText.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
    if (punctuationCount > cleanText.length * 0.3) {
      errors.push('Message contains too much punctuation');
    }
    
    // 8. Check for all caps (shouting)
    const upperCaseWords = words.filter(word => word === word.toUpperCase() && word.length > 2);
    if (upperCaseWords.length > words.length * 0.5) {
      errors.push('Please avoid typing in all capital letters');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Real-time validation
  if (messageInput) {
    let validationTimeout;
    
    messageInput.addEventListener('input', function() {
      clearTimeout(validationTimeout);
      
      validationTimeout = setTimeout(() => {
        const validation = detectGibberish(this.value);
        const messageContainer = this.parentElement;
        
        // Remove existing validation messages
        const existingError = messageContainer.querySelector('.validation-error');
        if (existingError) {
          existingError.remove();
        }
        
        // Remove existing validation classes
        this.classList.remove('border-red-500', 'border-blue-500');
        
        if (this.value.trim() === '') {
          return; // Don't show validation for empty field
        }
        
        if (!validation.isValid) {
          this.classList.add('border-red-500');
          const errorDiv = document.createElement('div');
          errorDiv.className = 'validation-error text-red-500 text-sm mt-1';
          errorDiv.innerHTML = validation.errors.join('<br>');
          messageContainer.appendChild(errorDiv);
          
          // Auto-remove error message after 4 seconds
          setTimeout(() => {
            if (errorDiv.parentNode) {
              errorDiv.remove();
            }
          }, 2500);
        } else {
          this.classList.add('border-blue-500');
          const successDiv = document.createElement('div');
          successDiv.className = 'validation-success text-blue-500 text-sm mt-1';
          successDiv.textContent = 'Message looks good!';
          messageContainer.appendChild(successDiv);
          
          // Auto-remove success message after 3 seconds
          setTimeout(() => {
            if (successDiv.parentNode) {
              successDiv.remove();
            }
          }, 1500);
        }
      }, 500); // Debounce validation
    });
    
    // Clear validation on focus
    messageInput.addEventListener('focus', function() {
      const existingError = this.parentElement.querySelector('.validation-error');
      const existingSuccess = this.parentElement.querySelector('.validation-success');
      if (existingError) existingError.remove();
      if (existingSuccess) existingSuccess.remove();
      this.classList.remove('border-red-500', 'border-blue-500');
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Show loading state
      submitBtn.disabled = true;
      submitText.classList.add('hidden');
      submitLoading.classList.remove('hidden');
      
      // Get form data
      const formData = new FormData(contactForm);
      
      // Validate message before submission
      const message = formData.get('message');
      const validation = detectGibberish(message);
      
      if (!validation.isValid) {
        showMessage(`Please fix the following issues:<br>${validation.errors.join('<br>')}`, 'error');
        // Reset button state
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        submitLoading.classList.add('hidden');
        return;
      }
      const data = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };

      try {
        // Option 1: Using Formspree (you need to create your own endpoint)
        // Replace 'YOUR_FORMSPREE_ENDPOINT' with your actual Formspree endpoint
        const response = await fetch('https://formspree.io/f/xanokjlw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          showMessage('Thank you! Your message has been sent successfully. I\'ll get back to you soon!', 'success');
          contactForm.reset();
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('Error:', error);
        
        // Fallback: Send email directly (this will open user's email client)
        const emailSubject = encodeURIComponent(`Portfolio Contact: ${data.subject}`);
        const emailBody = encodeURIComponent(`
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}
        `);
        
        const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;
        
        showMessage(`Form submission failed. <a href="${mailtoLink}" class="underline">Click here to send email directly</a> or try again later.`, 'error');
      } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitText.classList.remove('hidden');
        submitLoading.classList.add('hidden');
      }
    });
  }

  function showMessage(text, type) {
    messageText.innerHTML = text;
    formMessage.className = `mt-4 p-4 rounded-lg ${type === 'success' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-red-100 text-red-700 border border-red-200'}`;
    formMessage.classList.remove('hidden');
    
    // Auto-hide message after 8 seconds
    setTimeout(() => {
      formMessage.classList.add('hidden');
    }, 8000);
  }
});
  
// Performance Optimizations - Lazy Loading
document.addEventListener('DOMContentLoaded', function() {
  // Lazy loading for images
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => {
    imageObserver.observe(img);
  });

  // Preload critical images
  const criticalImages = [
    './assets/AbhijeetBhalePortfolio.jpg',
    'cursor.png'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });

  // Optimize scroll performance
  let ticking = false;
  
  function updateScrollIndicator() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    const progressBar = document.getElementById("scroll-indicator");
    if (progressBar) {
      progressBar.style.height = `${scrollPercent}%`;
    }
    
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollIndicator);
      ticking = true;
    }
  });

  // Service Worker registration for PWA features
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
});
  


// Theme + navigation
const themeBtn=document.getElementById('themeBtn');
const menuBtn=document.getElementById('menuBtn');
const nav=document.getElementById('desktop-nav');
const savedTheme=localStorage.getItem('youssef-theme');
if(savedTheme==='light') document.body.classList.add('light');
if(themeBtn) themeBtn.textContent=document.body.classList.contains('light')?'☾':'☼';
if(themeBtn) themeBtn.addEventListener('click',()=>{document.body.classList.toggle('light');localStorage.setItem('youssef-theme',document.body.classList.contains('light')?'light':'dark');themeBtn.textContent=document.body.classList.contains('light')?'☾':'☼';});
if(menuBtn) menuBtn.addEventListener('click',()=>nav.classList.toggle('open'));
if(nav) nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));

// Active nav link
const navLinks=[...document.querySelectorAll('#desktop-nav a')];
const sections=navLinks.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));}}),{rootMargin:'-35% 0px -55% 0px'});
sections.forEach(s=>io.observe(s));

// Custom cursor: subtle glowing dot + ring
if(window.matchMedia('(pointer:fine)').matches){
 const dot=document.createElement('div'); const ring=document.createElement('div'); dot.className='yo-cursor-dot'; ring.className='yo-cursor-ring'; document.body.append(dot,ring);
 let x=innerWidth/2,y=innerHeight/2;
 const getZoom=()=>parseFloat(getComputedStyle(document.body).zoom)||1;
 document.addEventListener('mousemove',e=>{
   const z=getZoom();
   x=e.clientX/z;y=e.clientY/z;
   dot.style.transform=`translate3d(${x}px,${y}px,0)`;
   ring.style.transform=`translate3d(${x}px,${y}px,0)`;
 });
 document.querySelectorAll('a,button,.project-card,.journey-card,.category-label').forEach(el=>{el.addEventListener('mouseenter',()=>ring.classList.add('hover'));el.addEventListener('mouseleave',()=>ring.classList.remove('hover'));});
}


// Skills category filters
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('tech-stack');
  if (!root) return;
  const filters = root.querySelectorAll('.skill-filter');
  const cards = root.querySelectorAll('.skill-card[data-category]');
  filters.forEach(btn => btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;
    filters.forEach(b => b.classList.toggle('active', b === btn));
    cards.forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('skill-hidden', !show);
      card.setAttribute('aria-hidden', String(!show));
    });
  }));
});
