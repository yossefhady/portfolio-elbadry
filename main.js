// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {

  // 1. Initialize Lenis Smooth Scrolling
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  // GSAP Sync with Lenis
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // 2. Custom Cursor Logic
  const cursor = document.querySelector('.cursor');
  let mouseX = 0;
  let mouseY = 0;
  
  // Follow mouse for devices that support hover
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      gsap.to(cursor, {
        x: mouseX,
        y: mouseY,
        duration: 0.1,
        ease: "power2.out"
      });
    });

    // Hover states for links
    const links = document.querySelectorAll('a, .highlight');
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        gsap.to(cursor, {
          scale: 3,
          backgroundColor: "var(--accent-cool)",
          duration: 0.3
        });
      });
      link.addEventListener('mouseleave', () => {
        gsap.to(cursor, {
          scale: 1,
          backgroundColor: "var(--accent-neon)",
          duration: 0.3
        });
      });
    });
    
    // 8. Magnetic Button Hover Effect
    const magnetics = document.querySelectorAll('.magnetic');
    magnetics.forEach((element) => {
      element.addEventListener('pointermove', (e) => {
        const rect = element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        gsap.to(element, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: "power3.out"
        });
      });

      element.addEventListener('pointerleave', () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.3)"
        });
      });
    });
  }

  // Set up responsive animations via gsap.matchMedia
  let mm = gsap.matchMedia();

  mm.add("(min-width: 601px)", () => {
    // 3. Initial Hero Reveal Animation (Desktop/Tablet)
    const heroTimeline = gsap.timeline({ defaults: { ease: "power4.out" } });
    
    heroTimeline.to('.staggered-item', {
      y: 0,
      opacity: 1,
      duration: 1.2,
      stagger: 0.15,
      delay: 0.2
    });

    // 4. Interactive 3D Mouse Parallax & ScrollTrigger for Shapes
    const heroSection = document.querySelector('.hero');
    heroSection.addEventListener('pointermove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1

      // Move photo wrapper slightly and tilt
      gsap.to('.designer-photo-wrapper', {
        x: x * 30,
        y: y * 30,
        rotationY: x * 10,
        rotationX: -y * 10,
        ease: "power2.out",
        duration: 0.6
      });

      // Move front neon sphere opposite (adds depth)
      gsap.to('.shape-1', {
        x: x * -80,
        y: y * -80,
        ease: "power2.out",
        duration: 0.6
      });

      // Move back blue rectangle slightly with mouse
      gsap.to('.shape-2', {
        x: x * 50,
        y: y * 50,
        ease: "power2.out",
        duration: 0.6
      });
    });

    // Reset rotation when leaving hero section
    heroSection.addEventListener('pointerleave', () => {
      gsap.to('.designer-photo-wrapper, .shape-1, .shape-2', {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationX: 0,
        ease: "elastic.out(1, 0.4)",
        duration: 1.5
      });
    });

    // Subtly append ScrollTrigger effects behind the mousemove
    gsap.to('.shape-1', {
      yPercent: -100, // Move via percent so it acts as an offset to the mouse 'y' bounds
      rotation: 45,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });

    gsap.to('.shape-2', {
      yPercent: 50,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.5
      }
    });

    // 5. Horizontal Scroll for Selected Works
    const worksTrack = document.querySelector('.works-track');
    
    if (worksTrack) {
      let scrollTween = gsap.to(worksTrack, {
        xPercent: -100,
        x: () => window.innerWidth, // offset to stop exactly at end
        ease: "none",
        scrollTrigger: {
          trigger: ".works-section",
          pin: true,
          scrub: 1,
          end: () => "+=" + worksTrack.offsetWidth
        }
      });

      // Image parallax inside cards during horizontal scroll
      gsap.utils.toArray('.work-image-wrapper img').forEach((img, i) => {
        gsap.fromTo(img, 
          { x: -50 }, 
          {
            x: 50,
            ease: "none",
            scrollTrigger: {
              trigger: img.closest('.work-card'),
              containerAnimation: scrollTween,
              start: "left right",
              end: "right left",
              scrub: true
            }
          }
        );
      });
    }

    // Modal Interaction for Projects
    const projectModal = document.querySelector('#projectModal');
    const modalClose = document.querySelector('#modalClose');
    const workCards = document.querySelectorAll('.work-card');
    
    // Prevent Lenis wheel events from passing through the modal
    projectModal.addEventListener('wheel', (e) => {
      e.stopPropagation();
    });
    
    // Mock Branding Data
    const projectData = {
      'neon-riot': { 
        title: 'NEON RIOT', 
        persona: 'Rebranding an underground electronic festival. High energy, chaotic, raw typography meets acidic gradients. Designed to disrupt local ad spaces.', 
        colors: ['#FF0055', '#111111', '#00FFCC'], 
        type: 'Primary: Anton<br>Secondary: Helvetica',
        images: ['https://picsum.photos/seed/acid1/800/1000', 'https://picsum.photos/seed/acid1b/800/600', 'https://picsum.photos/seed/acid1c/800/800']
      },
      'void-arch': { 
        title: 'VOID ARCH', 
        persona: 'Spatial identity for an architectural firm focusing on negative space and brutalist monuments. Pure structural aesthetic.', 
        colors: ['#FFFFFF', '#888888', '#000000'], 
        type: 'Primary: Space Mono<br>Secondary: Inter',
        images: ['https://picsum.photos/seed/acid2/800/1000', 'https://picsum.photos/seed/acid2b/800/600', 'https://picsum.photos/seed/acid2c/800/800']
      },
      'acid-conc': { 
        title: 'ACID TYPE', 
        persona: 'Custom display typeface designed for industrial techno records. Hard angles, deliberate ink traps, heavy modularity.', 
        colors: ['#D6D6D6', '#FF4D00', '#2400FF'], 
        type: 'Primary: Anton<br>Secondary: Space Mono',
        images: ['https://picsum.photos/seed/acid3/800/1000', 'https://picsum.photos/seed/acid3b/800/600', 'https://picsum.photos/seed/acid3c/800/800']
      },
      'echo-fest': { 
        title: 'ECHO FEST', 
        persona: 'Motion campaign for a contemporary arts festival. Sound waves translated into kinetic typography and physical wheatpaste posters.', 
        colors: ['#4400FF', '#DDDDDD', '#111111'], 
        type: 'Primary: Basier<br>Secondary: Arial',
        images: ['https://picsum.photos/seed/acid4/800/1000', 'https://picsum.photos/seed/acid4b/800/600', 'https://picsum.photos/seed/acid4c/800/800']
      },
    };

    workCards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-project');
        const data = projectData[id];
        if (data) {
          document.querySelector('#modalTitle').innerHTML = data.title;
          document.querySelector('#modalPersona').innerHTML = data.persona;
          document.querySelector('#modalType').innerHTML = data.type;
          
          // Inject album images
          const gallery = document.querySelector('#modalGalleryImages');
          gallery.innerHTML = data.images.map(imgSrc => `<img src="${imgSrc}" alt="${data.title} Mockup">`).join('');
          
          // Setup transition observer for album images
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
              } else {
                // Optional: remove class to animate back out when scrolled past
                entry.target.classList.remove('in-view');
              }
            });
          }, { root: gallery, threshold: 0.3 });
          
          // Allow DOM to update before observing
          requestAnimationFrame(() => {
            gallery.querySelectorAll('img').forEach(img => observer.observe(img));
          });
          
          const colorsContainer = document.querySelector('#modalColors');
          colorsContainer.innerHTML = data.colors.map(c => `<div class="swatch" style="background:${c}"></div>`).join('');
        }
        
        // Reset gallery scroll position
        const gallery = document.querySelector('#modalGalleryImages');
        if (gallery) gallery.scrollTop = 0;
        
        gsap.to(projectModal, {
          y: "0%",
          duration: 0.8,
          ease: "power4.inOut"
        });
      });
    });

    modalClose.addEventListener('click', () => {
      gsap.to(projectModal, {
        y: "100%",
        duration: 0.6,
        ease: "power3.in"
      });
    });

    // Draggable setup for Social section
    Draggable.create(".drag-item", {
      bounds: ".interactive-canvas",
      inertia: true,
      onDragStart: function() {
        gsap.set(this.target, { zIndex: 100 });
      },
      onDragEnd: function() {
        // Bring back to normal tier
        setTimeout(() => gsap.set(this.target, { zIndex: 1 }), 1);
      }
    });

    // Subtly animate draggable items entering
    gsap.from('.drag-item', {
      opacity: 0,
      scale: 0.5,
      rotation: 15,
      stagger: 0.2,
      scrollTrigger: {
        trigger: ".social-section",
        start: "top 50%"
      }
    });

    // Marquee effect for social title
    gsap.to('.text-marquee', {
      xPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: ".social-section",
        start: "top bottom",
        end: "bottom top",
        scrub: 1
      }
    });

    // 7. Kinetic Text Animation (Manifesto)
    gsap.utils.toArray('.kinetic-text').forEach((text, i) => {
      const isEven = i % 2 === 0;
      gsap.fromTo(text, 
        { xPercent: isEven ? 20 : -20 },
        {
          xPercent: isEven ? -20 : 20,
          ease: "none",
          scrollTrigger: {
            trigger: ".about-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        }
      );
    });

    // 7.5 About Section Reveal & Parallax
    const aboutTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".about-designer-section",
        start: "top 60%"
      }
    });

    // Reveal Image Mask (grow from bottom)
    aboutTl.to('.about-image-mask', {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 1.2,
      ease: "power4.inOut"
    });

    // Pop the badge
    aboutTl.to('.about-badge', {
      opacity: 1,
      rotation: -10,
      scale: 1,
      duration: 0.6,
      ease: "back.out(1.7, 0.3)"
    }, "-=0.5");

    // Stagger in paragraphs
    aboutTl.to('.about-paragraph p', {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out"
    }, "-=1.0");

    // Image parallax inside mask
    gsap.to('.about-img-parallax', {
      yPercent: 20, // moves the slightly oversized image to act as a parallax
      ease: "none",
      scrollTrigger: {
        trigger: ".about-designer-section",
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  });

  // Mobile layout - disable horizontal scroll & parallax for simpler vertical experience 
  mm.add("(max-width: 600px)", () => {
    // Just a simple fade-in for mobile load
    gsap.to('.staggered-item', {
      y: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.1,
      delay: 0.1
    });

    // Works Section becomes standard vertical scroll on mobile
    gsap.set('.works-track', { 
      flexDirection: 'column', 
      width: '100%', 
      xPercent: 0,
      gap: '2rem'
    });

    // About Section mobile simplified reveal
    const aboutMobileTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".about-designer-section",
        start: "top 75%"
      }
    });

    aboutMobileTl.to('.about-image-mask', {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 1
    })
    .to('.about-badge', { opacity: 1, duration: 0.5 }, "-=0.3")
    .to('.about-paragraph p', { y: 0, opacity: 1, duration: 0.8, stagger: 0.1 }, "-=0.5");

    // Social Masonry fade in
    gsap.utils.toArray('.grid-item').forEach((item, i) => {
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: item,
          start: "top 90%",
        }
      });
    });
    
  });

});
