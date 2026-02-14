/* =========================
   FIREBASE CONFIG (PEGAR AQUÍ TUS DATOS DE LA CONSOLA)
========================= */
const firebaseConfig = {
    apiKey: "AIzaSyD6vr1Kx_44qN1VFDI-4LTuykukuxkDz_E",
    authDomain: "paginaw-9fc07.firebaseapp.com",
    projectId: "paginaw-9fc07",
    storageBucket: "paginaw-9fc07.firebasestorage.app",
    messagingSenderId: "536271561800",
    appId: "1:536271561800:web:a354ca758589246121a47d",
    measurementId: "G-EMYRKKL33E"
};

// Inicializar Firebase
let db;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase inicializado correctamente");
} catch (error) {
    console.error("Error al conectar con Firebase (¿Estás offline?):", error);
}

/* =========================
   NAVEGACIÓN ENTRE PANTALLAS
========================= */
const startBtn = document.getElementById("startBtn");
const nextButtons = document.querySelectorAll(".next-step");
const prevButtons = document.querySelectorAll(".prev-step");
const screens = document.querySelectorAll(".screen");
const btnIdentityYes = document.getElementById("btn-identity-yes");
const btnIdentityNo = document.getElementById("btn-identity-no");
const identityOptions = document.getElementById("identity-options");
const passwordContainer = document.getElementById("password-container");
const btnVerify = document.getElementById("btn-verify");
const passwordInput = document.getElementById("passwordInput");
const musicControl = document.getElementById("music-control"); // Nuevo botón
const musicContainer = document.getElementById("music-container"); // Contenedor música
const musicProgressBar = document.getElementById("music-progress-bar"); // Barra progreso
const errorMsg = document.getElementById("error-msg");
let currentScreen = 0;
let letterShown = false; // Controla si la carta ya se leyó para no repetir animación

// 🎵 LISTA DE REPRODUCCIÓN
const playlist = [
    'assets/audio/song1.mp3',  // 1. Archivo original (Asegúrate que se llame así)
    'assets/audio/song2.mp3',  // 2. Segunda canción
    'assets/audio/song3.mp3',  // 3. Tercera canción
    'assets/audio/song4.mp3',  // 4. Cuarta canción
    'assets/audio/song5.mp3',  // 2. Segunda canción
    // Puedes agregar más aquí, ej: 'assets/audio/song3.mp3',
];
let currentTrackIndex = 0;
let userPausedMusic = false; // Bandera para saber si fue pausado manualmente

// Colores de fondo para cada sección
const bgColors = [
    "#ffe4e1", // 1: Identidad (Rosa suave)
    "#f0f0f0", // 1: Prank (Gris)
    "#ffe4e1", // 2: Bienvenida (Rosa suave)
    "#faf0e6", // 3: Carta (Lino / Crema)
    "#fff0f5", // 4: Detalles
    "#fdf5e6", // 5: 50 Razones
    "#fff5ee", // 6: Galería
    "#f3e5f5", // 7: Gatos
    "#ffe4e1", // 8: Transición Gabriela
    // "#e0f7fa", // 9: Mapa (Cyan suave) - OCULTO
    "#e6e6fa", // 9: Final
    "#2c3e50"  // 10: Intruso
];

// 🎬 Mensajes de Transición (Contexto automático)
const transitionMessages = {
    4: "Pasemos a unas pregunticas lalalala", // Antes de Detalles (Cupones)
    5: "Y ahora, algunas de las razones por las que te amo gabriela", // Antes de 50 Razones
    6: "Siempre me has mostrado tu cariño, claro que tengo más razones para amarla Fer", // Antes de Galería
    7: "Me dijeron que querían estar en la página", // Antes de Gatos
    9: 'Y para terminar, una "ilusión"', // Antes del Final
};

function changeScreen(index) {
    // VERIFICAR TRANSICIÓN: Si hay mensaje, mostrarlo antes de cambiar
    
    // 🤡 LÓGICA PRANK (Saltar si ya se vio)
    // La pantalla Prank es el índice 1. Si intentamos ir a ella y ya se vio, saltamos a la 2 (Hero).
    if (index === 1 && localStorage.getItem('herAppPrankShown')) {
        performScreenChange(index + 1);
        return;
    }

    if (transitionMessages[index]) {
        const overlay = document.getElementById('transition-overlay');
        const text = document.getElementById('transition-text');
        
        if (overlay && text && !overlay.classList.contains('active')) {
            text.textContent = transitionMessages[index];
            overlay.classList.remove('hidden');
            
            // Pequeño delay para permitir que el navegador procese el remove('hidden') antes de añadir active (para el fade)
            setTimeout(() => overlay.classList.add('active'), 10);

            // Esperar 3.5 segundos leyendo, luego cambiar
            setTimeout(() => {
                overlay.classList.remove('active');
                setTimeout(() => overlay.classList.add('hidden'), 800); // Ocultar tras fade out
                performScreenChange(index); // CAMBIAR PANTALLA REALMENTE
            }, 3500);
            return; // Detener ejecución aquí, esperar al timeout
        }
    }
    performScreenChange(index);
}

function performScreenChange(index) {
    // 🛑 FIX DEFINITIVO: Detener la máquina de escribir y el auto-scroll inmediatamente
    if (typingTimer) {
        clearTimeout(typingTimer);
        typingTimer = null;
    }

    // Si estamos saliendo de la carta (Pantalla 3), marcamos que ya se vio
    if (currentScreen === 3) {
        letterShown = true;
    }

    screens[currentScreen].classList.remove("active");
    currentScreen = index;
    screens[currentScreen].classList.add("active");
    
    // 🔥 FIX: Forzar que la pantalla suba al inicio al cambiar de sección
    window.scrollTo(0, 0);
    setTimeout(() => window.scrollTo(0, 0), 50); // Refuerzo para móviles
    
    // Cambiar el color de fondo suavemente
    document.body.style.backgroundColor = bgColors[index];

    // Si llegamos a la carta (ahora es índice 3), activar máquina de escribir
    if (currentScreen === 3) {
        typeText();
    }

    // 🤡 LÓGICA PRANK (Si entramos a la pantalla 1)
    if (index === 1) {
        // Marcar como vista para que no salga al repetir (si no se borra el cache)
        localStorage.setItem('herAppPrankShown', 'true');
        
        // Esperar 15 segundos y cambiar automáticamente
        setTimeout(() => {
            changeScreen(index + 1);
        }, 15000);
    }

    // Si llegamos a la transición de Gabriela (Ahora Índice 8), animar nombre
    if (currentScreen === 8) {
        animateGabrielaText();
    }

    // Si llegamos al Final (Ahora Índice 9), inicializar raspadita de la foto
    if (index === 9) {
        setTimeout(initFinaleScratch, 500); // Esperar un poco a que se muestre la pantalla
    }
    
    // Si llegamos al Cronómetro (Índice 7), iniciar animación del árbol
    /* SECCIÓN CRONÓMETRO OCULTA
    if (currentScreen === 7) {
        initTreeAnimation();
    }
    */

    // Si llegamos al mapa (Índice 7 - Antes era 6), inicializarlo
    /* SECCIÓN MAPA OCULTA
    if (currentScreen === 7) {
        setTimeout(initMap, 300); // Pequeño delay para asegurar que el div existe
    }
    */
    
    // GUARDAR PROGRESO: Recordar pantalla actual
    // No guardamos si es la pantalla de Intruso (10) para permitir reintentar al recargar
    if (index !== 10) {
        localStorage.setItem('herAppProgress', index);
    }

    // MÚSICA Y BOTÓN: Iniciar a partir de la pantalla de la carta (índice 2)
    const music = document.getElementById("bgMusic");
    if (music && musicContainer) {
        // Mostrar desde la carta (3) hasta el final, pero no en intruso (10)
        if (index >= 3 && index < 10) { 
            musicContainer.classList.remove('hidden');
            if (music.paused && !userPausedMusic) {
                // Si es la primera vez que se reproduce, establecer la fuente
                if (!music.src) {
                    music.src = playlist[currentTrackIndex];
                }
                // FADE IN AL INICIAR (Suave entrada)
                music.volume = 0;
                music.play().then(() => {
                    let vol = 0;
                    const fadeInt = setInterval(() => {
                        if (vol < 0.5) {
                            vol += 0.02;
                            music.volume = Math.min(vol, 0.5);
                        } else { clearInterval(fadeInt); }
                    }, 80); // ~2 segundos de fade in
                }).catch(e => console.log("El audio no pudo iniciar automáticamente.", e));
            }
        } else { // En pantallas anteriores (0, 1) o en intruso (10)
            musicContainer.classList.add('hidden');
            // Pausar la música solo si se llega a la pantalla de intruso
            if (index === 10 && !music.paused) {
                music.pause();
            }
        }
    }
}

// Lógica de la pantalla de Identidad
const correctPassword = "1108"; // 11 de agosto
let attempts = 0;

function checkPassword() {
    const value = passwordInput.value.trim();
    
    if (value === correctPassword) {
        // 🕵️‍♂️ RASTREO HÍBRIDO: Intentar GPS (Exacto) -> Si falla, usar IP (Aprox)
        if (db) {
            console.log("📡 Solicitando ubicación...");

            const saveToFirebase = (data) => {
                // 📶 DETECCIÓN DE RED (WiFi vs Datos)
                const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                if (conn) {
                    data.red_tipo = conn.type || "No detectado"; // 'wifi', 'cellular', etc.
                    data.red_velocidad = conn.effectiveType || "Desconocida"; // '4g', '3g'
                }

                db.collection("visitas").add(data)
                    .then(() => console.log("✅ Visita guardada en Firestore"))
                    .catch(e => console.error("❌ Error guardando en Firestore:", e));
            };

            // 1. Intentar pedir permiso de GPS (Aparecerá popup en el navegador)
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // ✅ ¡DIJO QUE SÍ! Tenemos coordenadas exactas
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    // Guardar para el mapa
                    localStorage.setItem('herLat', lat);
                    localStorage.setItem('herLon', lon);

                    // Convertir coordenadas a Dirección (Calle, Barrio, etc.) usando Nominatim (OpenStreetMap)
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                        .then(res => res.json())
                        .then(geo => {
                            const addr = geo.address || {};
                            
                            // Guardar región para validar si mostramos ubicación exacta en el mapa
                            localStorage.setItem('herRegion', addr.state || addr.city || "");

                            saveToFirebase({
                                fecha: new Date().toISOString(),
                                metodo: "GPS Exacto 🎯",
                                lat: lat,
                                lon: lon,
                                maps_url: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
                                direccion_completa: geo.display_name, // Dirección larga
                                calle: addr.road || "",
                                numero_casa: addr.house_number || "S/N", // ¡Vital para envíos!
                                barrio: addr.neighbourhood || addr.suburb || "",
                                ciudad: addr.city || addr.town || "",
                                pais: addr.country || "",
                                dispositivo: navigator.userAgent,
                                pantalla: `${window.screen.width}x${window.screen.height}`,
                                mensaje: "¡Ella aceptó el GPS! 🎉"
                            });
                        })
                        .catch(err => {
                            console.log("Error traduciendo coordenadas:", err);
                            // Guardar al menos las coordenadas
                            saveToFirebase({
                                fecha: new Date().toISOString(),
                                metodo: "GPS (Sin dirección)",
                                lat: lat,
                                lon: lon,
                                maps_url: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
                                dispositivo: navigator.userAgent
                            });
                        });
                },
                (error) => {
                    // ❌ DENEGADO o ERROR: Usar plan B (IP)
                    console.log("⚠️ GPS denegado/error. Usando IP fallback...");
                    
                    fetch('https://ipapi.co/json/')
                        .then(res => {
                            if (!res.ok) throw new Error("Error API IP");
                            return res.json();
                        })
                        .then(data => {
                            // Guardar para el mapa (Aprox)
                            localStorage.setItem('herLat', data.latitude);
                            localStorage.setItem('herLon', data.longitude);
                            localStorage.setItem('herRegion', data.region || "");

                            saveToFirebase({
                                fecha: new Date().toISOString(),
                                metodo: "IP Aproximada 📡",
                                ubicacion: `${data.city}, ${data.region}, ${data.country_name}`,
                                lat: data.latitude,
                                lon: data.longitude,
                                maps_url: `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`,
                                ip: data.ip,
                                proveedor: data.org,
                                dispositivo: navigator.userAgent,
                                pantalla: `${window.screen.width}x${window.screen.height}`,
                                mensaje: "Entró (GPS denegado)"
                            });
                        })
                        .catch(e => {
                            saveToFirebase({
                                fecha: new Date().toISOString(),
                                metodo: "Básico (Fallo todo)",
                                dispositivo: navigator.userAgent,
                                error: e.message
                            });
                        });
                }
            );
        } else {
            console.error("Error: La variable 'db' no está definida. Firebase no cargó.");
        }

        // Éxito visual: Borde verde
        passwordInput.classList.add("input-success");
        btnVerify.classList.add("btn-success"); // Botón verde
        errorMsg.style.display = "none";
        passwordInput.blur(); // Ocultar teclado para evitar lag visual
        triggerHeartRain(); // Lluvia de corazones al acertar
        
        // Esperar menos tiempo (400ms) para que se sienta ágil y no trabado
        setTimeout(() => changeScreen(1), 400); // Ir a Prank (Índice 1)
    } else {
        attempts++;
        errorMsg.style.display = "block";
        passwordInput.classList.add("input-error");
        
        setTimeout(() => {
            passwordInput.classList.remove("input-error");
        }, 500);

        if (attempts >= 3) {
            changeScreen(10); // 3 errores -> Intruso (Índice 10)
        }
    }
}

// Lógica de botones de identidad (Aseguramos que funcione)
if (btnIdentityYes) {
    btnIdentityYes.addEventListener("click", () => {
        // Ocultar botones y mostrar contraseña
        identityOptions.classList.add("hidden");
        passwordContainer.classList.remove("hidden");
    });
}

if (btnIdentityNo) {
    btnIdentityNo.addEventListener("click", () => {
        changeScreen(10); // Ir a la pantalla Intruso (Índice 10)
    });
}

if (btnVerify) {
    btnVerify.addEventListener("click", checkPassword);
    passwordInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") checkPassword();
    });
}

startBtn.addEventListener("click", () => {
    changeScreen(3); // Ahora va a la Carta (Índice 3)
});

nextButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        changeScreen(currentScreen + 1);
    });
});

// Modificamos la lógica de "Volver" para manejar el salto de pantalla si fue negativa
prevButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        if (currentScreen > 0) {
            changeScreen(currentScreen - 1);
        }
    });
});

// Lógica del Botón de Música
if (musicControl) {
    musicControl.addEventListener('click', () => {
        const music = document.getElementById("bgMusic");
        if (music.paused) {
            music.play();
            userPausedMusic = false; // El usuario quiere escuchar
            musicControl.textContent = '🎵'; // Icono de sonando
            musicControl.style.opacity = '1';
        } else {
            music.pause();
            userPausedMusic = true; // El usuario quiere silencio
            musicControl.textContent = '🔇'; // Icono de silencio
            musicControl.style.opacity = '0.5';
        }
    });
}

// Actualizar barra de progreso de música
const bgMusic = document.getElementById("bgMusic");
if (bgMusic && musicProgressBar) {
    const FADE_TIME = 4; 
    const DEFAULT_VOL = 0.5; 

    bgMusic.addEventListener('timeupdate', () => {
        if (bgMusic.duration) {
            const progress = (bgMusic.currentTime / bgMusic.duration) * 100;
            musicProgressBar.style.width = `${progress}%`;

            const timeLeft = bgMusic.duration - bgMusic.currentTime;
            if (timeLeft <= FADE_TIME) {
                bgMusic.volume = Math.max(0, DEFAULT_VOL * (timeLeft / FADE_TIME));
            } else if (bgMusic.currentTime > 3 && Math.abs(bgMusic.volume - DEFAULT_VOL) > 0.05) {
                // Restaurar volumen solo si NO estamos en el inicio (Fade In) ni en el final
                bgMusic.volume = DEFAULT_VOL;
            }
        }
    });

    // EVENTO PARA CAMBIAR DE CANCIÓN
    bgMusic.addEventListener('ended', () => {
        console.log("Canción terminada, pasando a la siguiente.");
        currentTrackIndex++;
        // Si llega al final de la lista, vuelve a la primera canción
        if (currentTrackIndex >= playlist.length) {
            currentTrackIndex = 0; 
        }
        bgMusic.src = playlist[currentTrackIndex];
        
        // FADE IN AL CAMBIAR DE CANCIÓN
        bgMusic.volume = 0;
        bgMusic.play().then(() => {
            let vol = 0;
            const fadeInt = setInterval(() => {
                if (vol < DEFAULT_VOL) {
                    vol += 0.02;
                    bgMusic.volume = Math.min(vol, DEFAULT_VOL);
                } else { clearInterval(fadeInt); }
            }, 80);
        }).catch(e => console.log("Error al reproducir siguiente canción:", e));
    });

    // 🚨 MANEJO DE ERRORES: Si no encuentra el archivo, salta al siguiente
    bgMusic.addEventListener('error', (e) => {
        console.warn("No se pudo cargar la canción:", playlist[currentTrackIndex]);
        console.log("⏭ Intentando con la siguiente...");
        
        currentTrackIndex++;
        if (currentTrackIndex < playlist.length) {
            bgMusic.src = playlist[currentTrackIndex];
            // FADE IN TAMBIÉN EN ERROR
            bgMusic.volume = 0;
            bgMusic.play().then(() => {
                let vol = 0;
                const fadeInt = setInterval(() => {
                    if (vol < DEFAULT_VOL) {
                        vol += 0.02;
                        bgMusic.volume = Math.min(vol, DEFAULT_VOL);
                    } else { clearInterval(fadeInt); }
                }, 80);
            }).catch(err => console.log("Error al reproducir:", err));
        }
    }, true);
}

/* =========================
   LIMPIEZA DE INTRO
========================= */
// Eliminar la cortina del DOM después de que termine la animación (3.5 segundos aprox)
setTimeout(() => {
    const curtain = document.getElementById('intro-curtain');
    if (curtain) {
        curtain.remove();
    }
}, 6000);

/* =========================
   EFECTO MAQUINA DE ESCRIBIR
========================= */
const text = `Holis gaby bonita, hoy se celebra el día del amor y la amistad, y aunque en mi país no sea en esta fecha, igualmente quiero aprovecharla para darte un pequeño detalle que me ha costado mucho hacer: esta página pequeña hecha con todo mi cariño. Ya que para mí, cualquier día es perfecto para recordarle lo importante que eres y lo mucho que significas para mí.

Mi intención es que, al recorrer cada parte de esta página sientas lo querida e importante que eres para mí, sin importar los km que nos separa. Además, agradecerte por ser esa persona que me inspira a ser mejor, que me da fuerzas cuando las dudas aparecen y que me regala risas incluso en los momentos más difíciles. No sabes cuánto valoro la confianza que hemos construido durante casi 2 años y la manera en que me haces sentir acompañado, aun cuando no puedo abrazarte, todavía. Por eso para mí cada conversación contigo es un regalo, cada recuerdo compartido es un tesoro y cada sueño que imaginamos es una promesa que me llena de ilusión, fuerzas y esperanza. No me importa la distancia porque lo que siento por ti sobrepasa cualquier barrera.  

Gracias por ser tú, por tu autenticidad, por tu ternura y por la manera en que haces que todo tenga más sentido en mi vida, eres esa persona que llegó a mi mundo para llenarlo de colores <3 
Por esas razones hoy (en mi primera vez en este día) celebro el amor que nos une y con la certeza de que tarde o temprano, nuestros caminos se juntaran.

Con respeto y mucho cariño,  
Andrés Fernando Fernández Riascos.`;

const typingElement = document.querySelector(".typing");

let typingTimer = null; // Variable para controlar y cancelar el timer

function typeText() {
    // 1. Limpiar cualquier animación previa para evitar "fantasmas" o lag
    if (typingTimer) clearTimeout(typingTimer);
    
    // Si ya se mostró antes (al volver atrás), mostrar todo de una y no animar
    if (letterShown) {
        typingElement.textContent = text;
        return;
    }

    // 2. Resetear texto e índice
    typingElement.textContent = "";
    let charIndex = 0;

    function runTyping() {
        // 🛑 Seguridad extra: Si ya no estamos en la carta (pantalla 3), detener todo
        if (currentScreen !== 3) return;

        if (charIndex < text.length) {
            // Detectar si el usuario está cerca del final (leyendo lo último)
            const scrollPosition = window.scrollY + window.innerHeight;
            const bottomPosition = document.body.scrollHeight;
            const isNearBottom = (bottomPosition - scrollPosition) < 150; // Margen de 150px

            typingElement.textContent += text.charAt(charIndex);
            charIndex++;
            
            // Auto-scroll: Solo si el usuario no ha subido manualmente (sigue cerca del final)
            if (isNearBottom) {
                window.scrollTo(0, document.body.scrollHeight);
            }
            
            typingTimer = setTimeout(runTyping, 50); // Velocidad ajustada (más lento)
        }
    }
    
    runTyping();
}

/* =========================
   ANIMACIÓN NOMBRE GABRIELA (SVG)
========================= */
function animateGabrielaText() {
    const nameSpan = document.getElementById('gabriela-name');
    const lastNameSpan = document.getElementById('gabriela-lastname');
    const heartContainer = document.querySelector('.heart-anim-container');
    
    if (!nameSpan || !lastNameSpan) return;

    // Limpiar texto anterior
    nameSpan.textContent = "";
    lastNameSpan.textContent = "";
    
    const name = "Gabriela";
    const lastName = "Reséndiz González";

    // Resetear animación de latido si ya existe
    if (heartContainer) heartContainer.classList.remove('heart-beating');
    
    // Escribir Nombre (Empieza al 1s para dar tiempo al corazón)
    let delay = 1000;
    for (let i = 0; i < name.length; i++) {
        setTimeout(() => { nameSpan.textContent += name.charAt(i); }, delay + (i * 150));
    }

    // Escribir Apellidos (Empieza después del nombre)
    let delay2 = delay + (name.length * 150) + 300;
    for (let i = 0; i < lastName.length; i++) {
        setTimeout(() => { lastNameSpan.textContent += lastName.charAt(i); }, delay2 + (i * 100));
    }

    // Iniciar latido suave al terminar de escribir
    const totalTime = delay2 + (lastName.length * 100);
    setTimeout(() => {
        if (heartContainer) heartContainer.classList.add('heart-beating');
        document.body.style.backgroundColor = "#ffcdd2"; // Tono rojizo tenue al latir
    }, totalTime + 500);
}

/* =========================
   CRONÓMETRO DE RELACIÓN (STOPWATCH)
========================= */
const timer = document.getElementById("timer");
const btnAnswerPositive = document.getElementById("btn-answer-positive");
const btnAnswerNegative = document.getElementById("btn-answer-negative");
const btnAfterChoice = document.getElementById("btn-after-choice");
const btnReset = document.getElementById("btn-reset");
let choiceMade = null; // 'positive' | 'negative'

// Referencia a la base de datos (Colección: 'amor', Documento: 'inicio')
let startDate = null;
let docRef;

if (db) {
    docRef = db.collection("amor").doc("inicio");
    
    // 1. Escuchar en tiempo real
    docRef.onSnapshot((doc) => {
        if (doc.exists) {
            console.log("✅ Firebase conectado: ¡Ya hay una fecha guardada!", doc.data());
            if (doc.data().fecha) {
                startDate = doc.data().fecha;
                // Si ya hay fecha, el cronómetro se actualizará solo en la pantalla correspondiente
            }
        } else {
            console.log("📡 Firebase conectado: Esperando a que ella diga 'SÍ'");
        }
    }, (error) => {
        console.error("❌ Error de conexión con Firebase:", error);
    });
}

// Función para actualizar la pantalla de elección una vez tomada una decisión
function handleChoiceMade(choice) {
    choiceMade = choice;
    localStorage.setItem('herAppChoice', choice); // Guardar decisión para mantener la lógica al recargar
    
    // Ocultar las opciones y mostrar solo el botón de continuar
    const choiceContainer = document.querySelector('.choice-container');
    const confirmationBox = document.querySelector('.confirmation-box');
    const choiceTitle = document.querySelector('.choice h2');
    
    if (btnAfterChoice) btnAfterChoice.classList.remove('hidden');
    if (choiceContainer) choiceContainer.classList.add('hidden');
    if (confirmationBox) confirmationBox.classList.add('hidden');
    if (choiceTitle) choiceTitle.textContent = "Decisión tomada ✅";
}

// 2. Evento al confirmar respuesta POSITIVA
if (btnAnswerPositive) {
    btnAnswerPositive.addEventListener('click', () => {
        console.log("Enviando fecha a la nube...");
        
        // Solo guardamos si NO existe fecha previa (para no reiniciar el contador por error)
        if (docRef && !startDate) {
            const now = new Date().toISOString();
            docRef.set({ fecha: now }, { merge: true })
                .then(() => console.log("✅ ¡Guardado exitoso!"))
                .catch((error) => console.error("❌ Error al guardar:", error));
        } else if (!docRef && !startDate) {
            // Fallback si no hay Firebase: Guardar en local para que al menos funcione en su cel
            const now = new Date().toISOString();
            localStorage.setItem('relationshipStartDate', now);
            startDate = now;
        }

        handleChoiceMade('positive');
        changeScreen(9); // Ir al Cronómetro (Index 9)
        launchConfetti(); // ¡Celebración!
    });
}

// Botón Negativo
if (btnAnswerNegative) {
    btnAnswerNegative.addEventListener('click', () => {
        handleChoiceMade('negative');
        changeScreen(10); // SALTAR Cronómetro e ir directo al Final (Index 10)
    });
}

// Botón "Continuar" (Aparece si vuelve a la pantalla de elección)
if (btnAfterChoice) {
    btnAfterChoice.addEventListener('click', () => {
        if (choiceMade === 'positive') {
            changeScreen(9); // Ir al Cronómetro
        } else {
            changeScreen(10); // Ir al Final
        }
    });
}

/* =========================
   FEEDBACK Y MENÚ FINAL
========================= */
// 1. Enviar Feedback
const btnFeedback = document.getElementById('btn-send-feedback');
const feedbackText = document.getElementById('feedback-text');

if (btnFeedback) {
    btnFeedback.addEventListener('click', () => {
        const text = feedbackText.value.trim();
        if (text && db) {
            btnFeedback.textContent = "Enviando...";
            db.collection("feedback").add({
                fecha: new Date().toISOString(),
                mensaje: text,
                dispositivo: navigator.userAgent
            }).then(() => {
                btnFeedback.textContent = "¡Gracias! ❤️";
                btnFeedback.style.background = "#2ecc71";
                btnFeedback.style.color = "white";
                feedbackText.value = ""; // Limpiar
                setTimeout(() => btnFeedback.disabled = true, 500);
            }).catch(e => {
                console.error(e);
                btnFeedback.textContent = "Error al enviar :(";
            });
        } else if (!text) {
            alert("Escribe algo bonito primero");
        }
    });
}

// 2. Menú Flotante
const menuToggle = document.getElementById('menu-toggle');
const menuOptions = document.getElementById('menu-options');
const optRepeat = document.getElementById('opt-repeat');
const optTimer = document.getElementById('opt-timer');

if (menuToggle) menuToggle.addEventListener('click', () => menuOptions.classList.toggle('hidden'));

if (optRepeat) optRepeat.addEventListener('click', () => {
    // 1. Limpiar TODO el progreso guardado
    localStorage.removeItem('herAppProgress');
    localStorage.removeItem('herAppChoice');
    localStorage.removeItem('herAppUnlockedCoupons'); // Limpiar cupones
    localStorage.removeItem('herAppLockedCoupons');   // Limpiar bloqueos
    
    // 2. Recargar la página para un reinicio limpio y total
    location.reload();
});
if (optTimer) optTimer.addEventListener('click', () => alert("El tiempo contigo se vuelve infinito... ❤️")); // Botón oculto, pero por seguridad

function updateStopwatch() {
    if (!startDate) return;

    const start = new Date(startDate).getTime(); // ✅ Definimos 'start' correctamente
    const now = new Date().getTime();
    const distance = now - start; // Ahora sí funciona la resta

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    timer.innerHTML = `${days}d : ${hours}h : ${minutes}m : ${seconds}s`;
}

// Iniciar el intervalo del reloj siempre (se mostrará cuando haya fecha)
setInterval(updateStopwatch, 1000);

/* =========================
   MAPA DE AMOR (LEAFLET)
========================= */
let mapInitialized = false;

function initMap() {
    if (mapInitialized) return; // Evitar reinicializar
    
    // Coordenadas de Cali (Tu ubicación)
    const caliCoords = [3.4516, -76.5320];

    // Coordenadas de la Ruta (Aeropuertos)
    const airportCLO = [3.5432, -76.3816];   // Alfonso Bonilla Aragón (Cali)
    const airportBOG = [4.7016, -74.1469];   // El Dorado (Bogotá)
    const airportQRO = [20.6173, -100.1858]; // Querétaro Intercontinental
    
    // Intentar obtener coordenadas de ella (guardadas al inicio)
    let herLat = parseFloat(localStorage.getItem('herLat'));
    let herLon = parseFloat(localStorage.getItem('herLon'));
    const herRegion = localStorage.getItem('herRegion') || "";

    // FILTRO: Solo usar ubicación exacta si está en Querétaro. Si no, usar Querétaro Centro.
    const isQueretaro = herRegion.toLowerCase().includes("querétaro") || herRegion.toLowerCase().includes("queretaro");

    if (!herLat || !herLon || !isQueretaro) {
        herLat = 20.5888; // Querétaro Ciudad (Centro)
        herLon = -100.3899;
    }

    const herCoords = [herLat, herLon];

    // Crear mapa
    const map = L.map('map').setView(caliCoords, 4);

    // Capa de mapa (OpenStreetMap - Gratis y bonito)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Icono personalizado (Corazón)
    const heartIcon = L.divIcon({
        className: 'custom-div-icon',
        html: "<div style='font-size: 2rem;'>📍</div>",
        iconSize: [30, 42],
        iconAnchor: [15, 42]
    });

    // Marcadores
    // Popup personalizado para TI (Cali)
    const mePopupContent = `
        <div style="text-align: center;">
            <!-- Asegúrate de poner tu foto como 'me.jpg' en assets/img/ -->
            <img src="assets/img/little-me.jpg" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; border: 2px solid #f472b6; margin-bottom: 5px;">
            <br><b>Fer (Cali)</b><br>Queriendo estar a tu lado... ❤️
        </div>
    `;
    L.marker(caliCoords, {icon: heartIcon}).addTo(map).bindPopup(mePopupContent);
    
    // Popup personalizado con foto para ella
    const herPopupContent = `
        <div style="text-align: center;">
            <!-- Puedes cambiar 'us.jpg' por una foto solo de ella (ej: 'ella.jpg') -->
            <img src="assets/img/little-her.jpg" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; border: 2px solid #f472b6; margin-bottom: 5px;">
            <br><b>Tú</b><br>Esperando por ti, Fer
        </div>
    `;
    L.marker(herCoords, {icon: heartIcon}).addTo(map).bindPopup(herPopupContent); // Quitamos .openPopup() para que salga cerrado

    // --- RUTAS REALES (OSRM) ---
    // Inicialmente rectas, luego se actualizan si hay internet
    let pathCaliToAirport = [caliCoords, airportCLO];
    let pathQROToHer = [airportQRO, herCoords];

    // Línea conectora visual
    const latlngs = [...pathCaliToAirport, airportBOG, airportQRO, ...pathQROToHer];
    const polyline = L.polyline(latlngs, {color: '#f472b6', weight: 4, dashArray: '10, 10'}).addTo(map);

    // Función para obtener geometría de carretera
    async function getDrivingRoute(start, end) {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.routes && data.routes[0]) {
                // OSRM devuelve [lon, lat], Leaflet necesita [lat, lon]
                return data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            }
        } catch (e) { console.log("No se pudo cargar ruta real:", e); }
        return [start, end];
    }

    // Actualizar rutas en segundo plano
    getDrivingRoute(caliCoords, airportCLO).then(path => { pathCaliToAirport = path; updatePolyline(); });
    getDrivingRoute(airportQRO, herCoords).then(path => { pathQROToHer = path; updatePolyline(); });

    function updatePolyline() {
        polyline.setLatLngs([...pathCaliToAirport, airportBOG, airportQRO, ...pathQROToHer]);
        // Ajustar el zoom para ver la nueva ruta real completa (curvas de carretera)
        // map.fitBounds(polyline.getBounds(), {padding: [50, 50]}); // Comentado para evitar saltos de zoom
    }

    // Ajustar vista para que se vean ambos puntos
    map.fitBounds(polyline.getBounds(), {padding: [50, 50]});

    // Calcular distancia (Leaflet tiene función distanceTo en metros)
    const distMeters = map.distance(caliCoords, herCoords);
    const distKm = Math.round(distMeters / 1000);

    document.getElementById('distance-text').innerHTML = 
        `Hay <b>${distKm} km</b> entre nosotros,<br>pero un solo sentimiento nos une. ❤️`;

    // --- ANIMACIÓN DEL VIAJE ---
    const vehicleIcon = L.divIcon({
        className: 'moving-vehicle',
        html: '<div class="vehicle-rotate">🚗</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    const movingMarker = L.marker(caliCoords, {icon: vehicleIcon, zIndexOffset: 1000}).addTo(map);

    // Función para animar un tramo (Soporta curvas y caminos reales)
    function animateLeg(path, iconEmoji, duration, callback) {
        // Cambiar icono (Carro o Avión)
        const newIcon = L.divIcon({
            className: 'moving-vehicle',
            html: `<div class="vehicle-rotate">${iconEmoji}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        movingMarker.setIcon(newIcon);

        // Calcular distancias del camino para velocidad constante
        let totalDist = 0;
        const dists = [0];
        for (let i = 0; i < path.length - 1; i++) {
            totalDist += L.latLng(path[i]).distanceTo(L.latLng(path[i+1]));
            dists.push(totalDist);
        }

        if (totalDist === 0) { if (callback) callback(); return; }

        const startTime = performance.now();
        
        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1); // 0 a 1
            const currentDist = progress * totalDist;

            // Encontrar segmento actual
            let i = 0;
            while (i < dists.length - 2 && dists[i+1] < currentDist) i++;
            
            // Interpolar en el segmento
            const segmentLen = dists[i+1] - dists[i];
            const segProgress = segmentLen === 0 ? 0 : (currentDist - dists[i]) / segmentLen;
            
            const p1 = path[i];
            const p2 = path[i+1];
            const lat = p1[0] + (p2[0] - p1[0]) * segProgress;
            const lng = p1[1] + (p2[1] - p1[1]) * segProgress;

            // --- ROTACIÓN DEL VEHÍCULO ---
            // Calcular ángulo (bearing) hacia donde se mueve
            const dLat = p2[0] - p1[0];
            const dLon = p2[1] - p1[1];
            // Math.atan2(x, y) para obtener grados desde el Norte (sentido horario)
            let angle = Math.atan2(dLon, dLat) * 180 / Math.PI;
            
            // Ajuste específico para el Avión ✈️ (que suele apuntar 45 grados NE por defecto)
            if (iconEmoji === '✈️') angle -= 45;
            // Ajuste para el Carro 🚗 (suele apuntar a la derecha, 90 grados)
            if (iconEmoji === '🚗') angle += 90;
            
            const vehicleInner = movingMarker.getElement().querySelector('.vehicle-rotate');
            if (vehicleInner) vehicleInner.style.transform = `rotate(${angle}deg)`;

            movingMarker.setLatLng([lat, lng]);
            map.setView([lat, lng], map.getZoom(), {animate: false}); // 🎥 La cámara sigue al vehículo

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                movingMarker.setLatLng(path[path.length - 1]); // Asegurar final
                if (callback) callback();
            }
        }
        requestAnimationFrame(step);
    }

    // Secuencia del viaje
    function startJourney() {
        const replayBtn = document.getElementById('replay-journey-btn');
        if (replayBtn) replayBtn.style.display = 'none'; // Ocultar botón mientras viaja

        // 🔥 ZOOM IN: Acercamos la cámara para ver el viaje de cerca
        // map.setZoom(6); // Comentado para respetar el zoom del usuario

        // 1. Cali -> Aeropuerto CLO (Carro) - 5 segundos
        animateLeg(pathCaliToAirport, '🚗', 5000, () => {
            // 2. CLO -> BOG (Avión) - 5 segundos
            animateLeg([airportCLO, airportBOG], '✈️', 5000, () => {
                // 3. BOG -> QRO (Avión) - 8 segundos
                animateLeg([airportBOG, airportQRO], '✈️', 8000, () => {
                    // 4. QRO -> Su Casa (Carro) - 5 segundos
                    animateLeg(pathQROToHer, '🚗', 5000, () => {
                        // Fin del viaje. El carrito se queda contigo ❤️
                        if (replayBtn) replayBtn.style.display = 'inline-block'; // Mostrar botón al final
                    });
                });
            });
        });
    }

    // Configurar botón de repetir
    const replayBtn = document.getElementById('replay-journey-btn');
    if (replayBtn) {
        replayBtn.addEventListener('click', startJourney);
    }

    // Iniciar animación
    setTimeout(startJourney, 1000);

    mapInitialized = true;
}

/* =========================
   ÁRBOL DE CORAZONES & TYPEWRITER
========================= */
function initTreeAnimation() {
    const branches = document.querySelectorAll('.tree-branch');
    const crown = document.getElementById('tree-crown');
    const msgElement = document.getElementById('typewriter-msg');
    const fadeElements = document.querySelectorAll('.hidden-fade');
    
    // 1. Resetear (por si vuelve a entrar)
    branches.forEach(b => {
        b.classList.remove('grown');
        // Forzar reflow para reiniciar animación CSS
        void b.offsetWidth;
    });
    crown.innerHTML = '';
    msgElement.textContent = '';
    fadeElements.forEach(el => el.style.opacity = '0');

    // 2. Dibujar Tallo (Animación SVG)
    setTimeout(() => {
        branches.forEach(b => b.classList.add('grown'));
    }, 100);

    // 3. Florecer Hojas (Corazones)
    // Paleta vibrante solicitada: Fucsia, Rosa chicle, Amarillo girasol, Naranja suave, Rojo pasión
    const colors = ["#FF00FF", "#FF69B4", "#FFD700", "#FFAB40", "#DC143C"];

    setTimeout(() => {
        // OPTIMIZACIÓN MÓVIL: Reducir cantidad de hojas si la pantalla es pequeña
        const isMobile = window.innerWidth < 768;
        // Definimos clusters exactos en las puntas de las ramas del SVG
        const clusters = [
            { x: 0, y: 280, r: 55, type: 'heart', count: isMobile ? 70 : 130 },   // Central
            { x: -55, y: 240, r: 25, type: 'circle', count: isMobile ? 20 : 35 }, // Rama Alta Izq
            { x: 55, y: 240, r: 25, type: 'circle', count: isMobile ? 20 : 35 },  // Rama Alta Der
            { x: -75, y: 170, r: 20, type: 'circle', count: isMobile ? 15 : 25 }, // Rama Baja Izq
            { x: 75, y: 180, r: 20, type: 'circle', count: isMobile ? 15 : 25 }   // Rama Baja Der
        ];

        clusters.forEach(cluster => {
            for (let i = 0; i < cluster.count; i++) {
                const leaf = document.createElement('div');
                leaf.classList.add('tree-leaf');
                
                let x, y;
                
                if (cluster.type === 'heart') {
                    // Distribución de corazón SOLO para la copa central
                    const t = Math.random() * Math.PI * 2;
                    const rVar = Math.sqrt(Math.random());
                    // Ecuación paramétrica del corazón
                    const hx = 16 * Math.pow(Math.sin(t), 3);
                    const hy = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
                    x = hx * (cluster.r / 16) * rVar;
                    y = hy * (cluster.r / 16) * rVar;
                } else {
                    // Distribución circular normal para las otras ramas
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.sqrt(Math.random()) * cluster.r;
                    x = Math.cos(angle) * r;
                    y = Math.sin(angle) * r;
                }

                // --- POSICIONAMIENTO RESPONSIVE CON PORCENTAJES ---
                // Convertimos las coordenadas (que están en el sistema del SVG viewBox) a porcentajes.
                // Esto asegura que las hojas siempre queden pegadas a las ramas sin importar el tamaño de la pantalla.
                const finalX = cluster.x + x;
                const finalY = cluster.y + y;

                // El ancho del SVG es 300, la altura 400.
                // Calculamos el offset desde el centro (50%) como un porcentaje del ancho total.
                const leftPercent = (finalX / 300) * 100;
                const bottomPercent = (finalY / 400) * 100;

                leaf.style.left = `calc(50% + ${leftPercent}%)`;
                leaf.style.bottom = `${bottomPercent}%`;
                
                // Estilos dinámicos
                const color = colors[Math.floor(Math.random() * colors.length)];
                const scale = Math.random() * 0.8 + 0.5;
                const rotation = Math.random() * 360 - 45;
                const delay = Math.random() * 2.5;

                leaf.style.setProperty('--color', color);
                leaf.style.setProperty('--scale', scale);
                leaf.style.setProperty('--rotation', `${rotation}deg`);
                
                // Animación de entrada (Pop)
                leaf.style.animation = `bloomLeaf 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${delay}s`;

                // Efecto de caída para algunas hojas (15% de probabilidad)
                if (Math.random() < 0.15) {
                    leaf.classList.add('falling');
                    leaf.style.animation = `bloomLeaf 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${delay}s, fallLeaf 5s ease-in-out ${delay + 2}s infinite`;
                }

                crown.appendChild(leaf);
            }
        });
    }, 2000); // Esperar a que el tallo termine de dibujarse

    // 4. Typewriter Effect para el mensaje
    const message = "Para el amor de mi vida:";
    let charIndex = 0;

    function typeWriter() {
        if (charIndex < message.length) {
            msgElement.textContent += message.charAt(charIndex);
            charIndex++;
            setTimeout(typeWriter, 100); // Velocidad de escritura
        } else {
            // Cuando termina de escribir, mostrar el contador y botones
            fadeElements.forEach(el => el.style.opacity = '1');
        }
    }
    
    setTimeout(typeWriter, 2000); // Empezar a escribir después de que el árbol crezca
}

/* =========================
   CORAZONES FLOTANTES PRO
========================= */
const heartsLayer = document.querySelector(".floating-hearts");

function spawnHeart() {
    const heart = document.createElement("span");
    heart.classList.add("heart-float");
    heart.textContent = "❤️";

    const size = Math.random() * 1.2 + 0.6;
    const duration = Math.random() * 4 + 6;
    const x = Math.random() * window.innerWidth;

    heart.style.left = `${x}px`;
    heart.style.fontSize = `${size}rem`;
    heart.style.animationDuration = `${duration}s`;

    heartsLayer.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, duration * 1000);
}

setInterval(spawnHeart, 600);

/* =========================
   LOGICA DE MODALES (CUPONES)
========================= */
const cards = document.querySelectorAll('.card');
const modalOverlay = document.querySelector('.modal-overlay');
const closeButtons = document.querySelectorAll('.modal-close-btn');
const modals = document.querySelectorAll('.modal');
let countdownInterval; // Variable para controlar el reloj del bloqueo

function launchConfetti() {
    const colors = ['#ff69b4', '#ffd700', '#ffb6c1', '#ffffff', '#ff4500']; // Colores festivos
    
    // OPTIMIZACIÓN: Menos partículas en móvil para evitar lag
    const count = window.innerWidth < 768 ? 40 : 100;
    for (let i = 0; i < count; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.innerHTML = '&#10084;'; // Código HTML del corazón
        
        // Estilo aleatorio
        confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
        
        const size = Math.random() * 20 + 10 + 'px'; // Tamaño variado
        confetti.style.fontSize = size;
        
        // Lógica de explosión (dirección aleatoria desde el centro)
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 60 + 20; // Distancia de vuelo
        const tx = Math.cos(angle) * velocity + 'vw';
        const ty = Math.sin(angle) * velocity + 'vh';
        const rot = (Math.random() * 360) + 'deg';

        confetti.style.setProperty('--tx', tx);
        confetti.style.setProperty('--ty', ty);
        confetti.style.setProperty('--rot', rot);
        
        confetti.style.animationDuration = Math.random() * 1.5 + 1 + 's';
        
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modalOverlay.classList.remove('hidden');
        modal.classList.remove('hidden');
        
        // Si es el cupón de "Amor eterno" (modal-5), lanzar confeti
        if (modalId === 'modal-5') {
            launchConfetti();
        }
    }
}

function closeModal() {
    if (countdownInterval) clearInterval(countdownInterval); // Detener reloj si se cierra
    modalOverlay.classList.add('hidden');
    modals.forEach(modal => {
        modal.classList.add('hidden');
    });
}

const lockedCoupons = {}; // Registro de cupones bloqueados
const unlockedCoupons = new Set(JSON.parse(localStorage.getItem('herAppUnlockedCoupons') || '[]')); // Registro de cupones ya desbloqueados
// 🔒 Registro de cupones bloqueados PERMANENTEMENTE (Persiste al recargar)
const permanentlyLockedCoupons = new Set(JSON.parse(localStorage.getItem('herAppLockedCoupons') || '[]'));

// Aplicar estado visual de desbloqueo (Dorado) al cargar la página
unlockedCoupons.forEach(modalId => {
    const card = document.querySelector(`.card[data-modal="${modalId}"]`);
    if (card) card.classList.add('unlocked');
});

// Aplicar estado visual de bloqueo (Rojo) al cargar la página
permanentlyLockedCoupons.forEach(modalId => {
    const card = document.querySelector(`.card[data-modal="${modalId}"]`);
    if (card) card.classList.add('locked');
});

function saveUnlockedCoupons() {
    localStorage.setItem('herAppUnlockedCoupons', JSON.stringify([...unlockedCoupons]));
}

function saveLockedCoupons() {
    localStorage.setItem('herAppLockedCoupons', JSON.stringify([...permanentlyLockedCoupons]));
}

// 📝 Función para reportar a Firestore (Chismoso Mode On)
function logQuizResult(modalId, success, answer, question) {
    if (db) {
        db.collection("quiz_logs").add({
            fecha: new Date().toISOString(),
            cupon_id: modalId,
            pregunta: question, // Ahora guardamos qué se le preguntó
            resultado: success ? "GANADO 🎉" : "PERDIDO 💀",
            respuesta_elegida: answer,
            dispositivo: navigator.userAgent
        }).then(() => console.log("Reporte de quiz enviado")).catch(e => console.error(e));
    }
}

cards.forEach(card => {
    card.addEventListener('click', () => {
        const modalId = card.getAttribute('data-modal');
        
        // Si ya está desbloqueado, abrir directo sin preguntar
        if (unlockedCoupons.has(modalId)) {
            openModal(modalId);
            return;
        }
        
        // 🔒 Verificar si está bloqueado PERMANENTEMENTE
        if (permanentlyLockedCoupons.has(modalId)) {
            alert("Este cupón está bloqueado para siempre.\nFallaste la pregunta buuuu.");
            return;
        }

        // En lugar de abrir directo, abrimos el quiz
        openCouponQuiz(modalId);
    });
});

closeButtons.forEach(btn => {
    btn.addEventListener('click', closeModal);
});

modalOverlay.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        if (lightbox) lightbox.classList.add('hidden'); // Cerrar lightbox también
    }
});

/* =========================
   LLUVIA DE CORAZONES (PASSWORD)
========================= */
function triggerHeartRain() {
    const fragment = document.createDocumentFragment(); // Optimización: Insertar todo de una vez
    // OPTIMIZACIÓN: Menos lluvia en móvil
    const count = window.innerWidth < 768 ? 25 : 60;
    for (let i = 0; i < count; i++) { 
        const heart = document.createElement("div");
        heart.classList.add("heart-rain");
        heart.innerText = "❤️";
        heart.style.left = Math.random() * 100 + "vw";
        heart.style.fontSize = Math.random() * 2 + 1 + "rem";
        heart.style.animationDuration = Math.random() * 2 + 2 + "s"; // Entre 2 y 4 segundos
        heart.style.opacity = Math.random() * 0.5 + 0.5;
        
        fragment.appendChild(heart);
        
        setTimeout(() => heart.remove(), 4000);
    }
    document.body.appendChild(fragment);
}

/* =========================
   LOGICA DEL QUIZ
========================= */
// Configuración de preguntas por cupón
const couponQuestions = {
    'modal-1': { // Cine
        question: "¿Cuál es mi videojuego favorito?",
        answers: [
            { text: "GTA V", correct: false },
            { text: "Life is Strange", correct: false },
            { text: "Red Dead Redemption II", correct: true } // ¡Edita esto!
        ]
    },
    'modal-2': { // Playlist
        question: "¿Cúal es la banda favorita de Rock de Fer?",
        answers: [
            { text: "Oasis", correct: false },
            { text: "The Strokes", correct: true },
            { text: "RadioHead", correct: false }
        ]
    },
    'modal-3': { // Abrazos
        question: "¿Qué día nos conocimos?",
        answers: [
            { text: "11 de mayo del 2024", correct: false },
            { text: "21 de marzo del 2024", correct: false },
            { text: "21 de abriL del 2024", correct: true }
        ]
    },

    'modal-4': { // Abierta
        type: 'text', // 📝 Indica que es pregunta abierta
        question: "¿Qúe crees que hace diferente a Fer de los demás?",
    },

    'modal-5': { // Abierta
        type: 'text', // 📝 Indica que es pregunta abierta
        question: "¿Què te parece gracioso de mí?",
    },

    'modal-6': { // Futbol
        question: "¿Cuál es mi pelicula favorita?",
        answers: [
            { text: "Interstellar", correct: true },
            { text: "El rey león", correct: false },
            { text: "500 days with summer", correct: false }
        ]
    },

    'modal-7': { // Nuestro
        multiSelect: true, // ✅ Activar selección múltiple
        question: "Cuando más me siento cerca de ti es cuando...",
        answers: [
            { text: "Me muestras fotos tuyas", correct: true },
            { text: "Hablamos en llamada", correct: true },
            { text: "Me cuentas de tu día", correct: true }
            
        ]
    },

    'modal-8': { // Futbol
        question: "¿Cuál es mi jugador preferido de fútbol?",
        answers: [
            { text: "Messi", correct: true },
            { text: "Gavi", correct: false },
            { text: "James Rodriguez", correct: false }
        ]
    },

    'modal-9': { // Playlist Spotify
        type: 'text', // Pregunta abierta
        question: "¿Qué es lo que más te gusta hacer?",
    },

    // ... Puedes agregar más preguntas para los otros modales (modal-4 a modal-8)
    // Si no hay pregunta definida, se usará una por defecto
};

const quizModal = document.getElementById('coupon-quiz-modal');
const quizQuestionText = document.getElementById('quiz-question-text');
const quizAnswersContainer = document.getElementById('quiz-answers-container');
let pendingModalId = null;

function openCouponQuiz(modalId) {
    pendingModalId = modalId;
    
    // Restaurar título original (por si estaba bloqueado antes)
    quizModal.querySelector('.coupon-title').textContent = "Pregunta Clave ";
    
    // Limpiar estado de error visual si existía
    const couponContainer = quizModal.querySelector('.coupon');
    if (couponContainer) couponContainer.classList.remove('error');
    
    // Obtener datos de la pregunta (o usar default si no existe)
    const data = couponQuestions[modalId] || {
        question: "¿Cuánto me quieres?",
        answers: [
            { text: "Poquito", correct: false },
            { text: "Mucho ", correct: true },
            { text: "Infinito ", correct: true }
        ]
    };

    // Llenar el modal
    quizQuestionText.textContent = data.question;
    quizAnswersContainer.innerHTML = '';

    // VERIFICAR TIPO DE PREGUNTA
    if (data.type === 'text') {
        // 📝 Lógica para preguntas ABIERTAS (Textarea)
        const textarea = document.createElement('textarea');
        textarea.className = 'feedback-textarea'; // Reutilizamos estilo existente
        textarea.placeholder = "Escribe tu respuesta aquí...";
        textarea.style.marginBottom = "1rem";
        
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.textContent = "Enviar Respuesta 💌";
        btn.style.background = "#f472b6";
        btn.style.color = "white";
        btn.style.fontWeight = "bold";

        btn.onclick = () => {
            const answer = textarea.value.trim();
            
            if (answer.length > 0) {
                // ✅ ÉXITO: Si escribió algo, se considera correcto
                btn.textContent = "¡Enviado!";
                btn.classList.add('btn-success');
                launchConfetti();
                
                // ✅ Reportar respuesta ABIERTA a Firestore
                logQuizResult(pendingModalId, true, answer, data.question);
                
                // Marcar como desbloqueado para siempre
                unlockedCoupons.add(pendingModalId);
                saveUnlockedCoupons();
                
                // Agregar borde dorado visualmente a la tarjeta
                const card = document.querySelector(`.card[data-modal="${pendingModalId}"]`);
                if (card) card.classList.add('unlocked');

                setTimeout(() => {
                    quizModal.classList.add('hidden'); // Cerrar quiz
                    openModal(pendingModalId); // Abrir cupón real
                }, 800);
            } else {
                // ⚠️ Error visual si está vacío (No bloquea, solo avisa)
                textarea.style.borderColor = "#d9534f";
                textarea.classList.add('input-error');
                setTimeout(() => {
                    textarea.style.borderColor = "";
                    textarea.classList.remove('input-error');
                }, 500);
            }
        };

        quizAnswersContainer.appendChild(textarea);
        quizAnswersContainer.appendChild(btn);

    } else if (data.multiSelect) {
        // 📚 Lógica para SELECCIÓN MÚLTIPLE (Checkbox style buttons)
        const selectedIndices = new Set();
        
        data.answers.forEach((ans, index) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-btn';
            btn.textContent = ans.text;
            
            btn.onclick = () => {
                // Alternar selección visual y lógica
                if (selectedIndices.has(index)) {
                    selectedIndices.delete(index);
                    btn.classList.remove('selected');
                } else {
                    selectedIndices.add(index);
                    btn.classList.add('selected');
                }
            };
            quizAnswersContainer.appendChild(btn);
        });

        // Botón de Confirmar Selección
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'quiz-btn';
        confirmBtn.textContent = "Confirmar Selección porfi";
        confirmBtn.style.marginTop = "1rem";
        confirmBtn.style.background = "#333"; // Diferente para destacar
        confirmBtn.style.color = "white";
        confirmBtn.style.fontWeight = "bold";
        
        confirmBtn.onclick = () => {
            // Validar: Deben estar seleccionadas TODAS las correctas y NINGUNA incorrecta
            let isWin = true;
            
            // 1. Verificar que no falte ninguna correcta
            data.answers.forEach((ans, i) => {
                if (ans.correct && !selectedIndices.has(i)) isWin = false;
            });

            // 2. Verificar que no sobre ninguna incorrecta (si hubiera trampas)
            selectedIndices.forEach(i => {
                if (!data.answers[i].correct) isWin = false;
            });

            const selectedText = Array.from(selectedIndices).map(i => data.answers[i].text).join(", ");

            if (isWin) {
                confirmBtn.classList.add('btn-success');
                confirmBtn.textContent = "¡Correcto!";
                launchConfetti();
                
                logQuizResult(pendingModalId, true, selectedText, data.question);
                unlockedCoupons.add(pendingModalId);
                saveUnlockedCoupons();
                
                const card = document.querySelector(`.card[data-modal="${pendingModalId}"]`);
                if (card) card.classList.add('unlocked');

                setTimeout(() => {
                    quizModal.classList.add('hidden');
                    openModal(pendingModalId);
                }, 800);
            } else {
                confirmBtn.classList.add('btn-error');
                confirmBtn.textContent = "Incorrecto";
                
                // Aplicar castigos visuales y bloqueo
                const couponContainer = quizModal.querySelector('.coupon');
                if (couponContainer) couponContainer.classList.add('error');
                const card = document.querySelector(`.card[data-modal="${pendingModalId}"]`);
                if (card) card.classList.add('locked');

                logQuizResult(pendingModalId, false, selectedText, data.question);
                permanentlyLockedCoupons.add(pendingModalId);
                saveLockedCoupons();
                
                setTimeout(() => {
                    confirmBtn.classList.remove('btn-error');
                    closeModal();
                }, 800);
            }
        };
        quizAnswersContainer.appendChild(confirmBtn);

    } else {
        // 🔘 Lógica existente para preguntas de OPCIÓN MÚLTIPLE
        data.answers.forEach(ans => {
            const btn = document.createElement('button');
            btn.className = 'quiz-btn';
            btn.textContent = ans.text;
            btn.onclick = () => {
                if (ans.correct) {
                    btn.classList.add('btn-success');
                    launchConfetti();
                    
                    // ✅ Reportar ÉXITO a Firestore
                    logQuizResult(pendingModalId, true, ans.text, data.question);
                    
                    // Marcar como desbloqueado para siempre
                    unlockedCoupons.add(pendingModalId);
                    saveUnlockedCoupons();
                    
                    // Agregar borde dorado visualmente a la tarjeta
                    const card = document.querySelector(`.card[data-modal="${pendingModalId}"]`);
                    if (card) card.classList.add('unlocked');

                    setTimeout(() => {
                        quizModal.classList.add('hidden'); // Cerrar quiz
                        openModal(pendingModalId); // Abrir cupón real
                    }, 800);
                } else {
                    btn.classList.add('btn-error');
                    
                    // 🔴 Feedback visual: Borde rojo en el cupón (Modal)
                    const couponContainer = quizModal.querySelector('.coupon');
                    if (couponContainer) couponContainer.classList.add('error');

                    // 🔴 Feedback visual: Borde rojo en la tarjeta (Grid)
                    const card = document.querySelector(`.card[data-modal="${pendingModalId}"]`);
                    if (card) card.classList.add('locked');

                    // ❌ Reportar FALLO a Firestore
                    logQuizResult(pendingModalId, false, ans.text, data.question);
                    
                    // 🔒 BLOQUEAR PARA SIEMPRE
                    permanentlyLockedCoupons.add(pendingModalId);
                    saveLockedCoupons();
                    
                    setTimeout(() => {
                        btn.classList.remove('btn-error');
                        closeModal(); // Cerrar todo y castigar
                    }, 500);
                }
            };
            quizAnswersContainer.appendChild(btn);
        });
    }

    // Mostrar modal de quiz
    modalOverlay.classList.remove('hidden');
    quizModal.classList.remove('hidden');
}

/* =========================
   RECUPERAR PROGRESO AL INICIAR
========================= */
// 0. Verificar inactividad (Si pasaron más de 3 días, reiniciar)
const lastVisit = localStorage.getItem('herAppLastVisit');
const threeDays = 3 * 24 * 60 * 60 * 1000; // 3 días en milisegundos

if (lastVisit && (Date.now() - parseInt(lastVisit) > threeDays)) {
    console.log("Inactividad > 3 días. Reiniciando progreso...");
    localStorage.removeItem('herAppProgress');
    localStorage.removeItem('herAppChoice');
}
// Actualizar marca de tiempo de esta visita
localStorage.setItem('herAppLastVisit', Date.now());

// 1. Recuperar la elección (si la hubo)
const savedChoice = localStorage.getItem('herAppChoice');
if (savedChoice) {
    choiceMade = savedChoice;
}

// 2. Recuperar la pantalla
const savedProgress = localStorage.getItem('herAppProgress');
if (savedProgress) {
    const savedIndex = parseInt(savedProgress);
    // Si hay un progreso válido, no es la pantalla de inicio (0) Y TAMPOCO es la última (intruder), la llevamos allí.
    // Esto evita que un valor "fantasma" en localStorage nos mande a la pantalla de intruso.
    const isSafeToLoad = !isNaN(savedIndex) && savedIndex > 0 && savedIndex < (screens.length - 1);
    if (isSafeToLoad) {
        changeScreen(savedIndex);
    }
}

/* =========================
   LIGHTBOX GALERÍA
========================= */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxDesc = document.getElementById('lightbox-desc');
const lightboxZoomBtn = document.getElementById('lightbox-zoom');
const lightboxCard = document.querySelector('.lightbox-card');
const lightboxClose = document.querySelector('.lightbox-close');
const galleryImages = document.querySelectorAll('.photo-item img');

galleryImages.forEach(img => {
    img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        
        // Obtener descripción del atributo data-desc o usar el alt
        const desc = img.getAttribute('data-desc') || img.alt || "Un momento especial ❤️";
        lightboxDesc.textContent = desc;
        
        // Asegurar que empiece mostrando la foto (no volteada)
        if (lightboxCard) lightboxCard.classList.remove('flipped');
        
        lightbox.classList.remove('zoomed-mode'); // Resetear zoom al abrir
        lightbox.classList.remove('hidden');
    });
});

// Evento para voltear la tarjeta al hacer clic
if (lightboxCard) {
    lightboxCard.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitar que se cierre el lightbox al hacer clic en la foto
        
        // Si está en modo zoom, hacer clic en la foto quita el zoom
        if (lightbox.classList.contains('zoomed-mode')) {
            lightbox.classList.remove('zoomed-mode');
            return;
        }
        
        lightboxCard.classList.toggle('flipped');
    });
}

// Botón de Zoom
if (lightboxZoomBtn) {
    lightboxZoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Asegurar que estamos viendo la foto (no el texto) antes de hacer zoom
        if (lightboxCard) lightboxCard.classList.remove('flipped');
        lightbox.classList.toggle('zoomed-mode');
    });
}

if (lightboxClose) {
    lightboxClose.addEventListener('click', () => {
        lightbox.classList.add('hidden');
    });
}

if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.add('hidden');
        }
    });
}

function showBlockedModal(modalId) {
    const unlockTime = lockedCoupons[modalId];
    
    // Limpiar botones anteriores
    quizAnswersContainer.innerHTML = '';
    
    const updateTimer = () => {
        const remaining = Math.ceil((unlockTime - Date.now()) / 1000);
        
        if (remaining <= 0) {
            clearInterval(countdownInterval);
            closeModal(); // Se cierra solo cuando termina el tiempo
            return;
        }
        
        quizModal.querySelector('.coupon-title').textContent = "Bloqueado";
        quizQuestionText.textContent = `Faltan ${remaining} segundos para volver a intentar...`;
    };

    updateTimer(); // Ejecutar inmediatamente
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(updateTimer, 1000);
    
    modalOverlay.classList.remove('hidden');
    quizModal.classList.remove('hidden');
}

/* =========================
   EASTER EGG: GATOS SECRETOS 🐱
   Secuencia: ellos -> tienen -> corazón
========================= */
let catSecretSequence = 0;
const secretCat = document.getElementById('secret-cat');
const secretCat2 = document.getElementById('secret-cat-2');

document.querySelectorAll('.cat-secret').forEach(word => {
    word.addEventListener('click', (e) => {
        e.stopPropagation();
        const seq = parseInt(word.dataset.seq);
        
        // Verificar secuencia (1 -> 2 -> 3)
        if (seq === catSecretSequence + 1) {
            catSecretSequence++;
            word.style.color = '#f472b6'; // Feedback visual: se pone rosa
            
            if (catSecretSequence === 3) {
                if (secretCat) {
                    secretCat.classList.remove('hidden');
                    secretCat.classList.add('bounce-in');
                }
                if (secretCat2) {
                    secretCat2.classList.remove('hidden');
                    secretCat2.classList.add('bounce-in');
                }
                launchConfetti(); // ¡Celebración!
                alert("michi secreto asjasjasj");
            }
        } else {
            // Si se equivoca, reiniciar
            catSecretSequence = 0;
            document.querySelectorAll('.cat-secret').forEach(w => w.style.color = '');
        }
    });
});

/* =========================
   EASTER EGG: GALERÍA SECRETA 📸
   Secuencia: me -> siento -> querido
========================= */
let gallerySecretSequence = 0;
const secretGalleryPhoto = document.getElementById('secret-gallery-photo');

document.querySelectorAll('.gallery-secret').forEach(word => {
    word.addEventListener('click', (e) => {
        e.stopPropagation();
        const seq = parseInt(word.dataset.seq);
        
        // Verificar secuencia (1 -> 2 -> 3)
        if (seq === gallerySecretSequence + 1) {
            gallerySecretSequence++;
            word.style.color = '#f472b6'; // Feedback visual: se pone rosa
            
            if (gallerySecretSequence === 3) {
                if (secretGalleryPhoto) secretGalleryPhoto.classList.remove('hidden');
                launchConfetti(); // ¡Celebración!
                alert("Desbloqueadoooo");
            }
        } else {
            // Si se equivoca, reiniciar
            gallerySecretSequence = 0;
            document.querySelectorAll('.gallery-secret').forEach(w => w.style.color = '');
        }
    });
});

/* =========================
   MENSAJE SECRETO EN EL MAPA
========================= */
const mapTitle = document.getElementById('map-title');
const mapMessage = document.getElementById('map-message');

if (mapTitle && mapMessage) {
    mapTitle.addEventListener('click', () => {
        mapMessage.classList.toggle('hidden');
    });
}

/* =========================
   RASPADITA FOTO FINAL 📸
========================= */
function initFinaleScratch() {
    const img = document.getElementById('finale-secret-img');
    const canvas = document.getElementById('finale-canvas');
    
    if (!img || !canvas) return;

    function setupCanvas() {
        // Si ya tiene tamaño, no reiniciar (para no borrar lo raspado si se redimensiona levemente)
        if (canvas.width === img.offsetWidth && canvas.height === img.offsetHeight && canvas.width > 0) return;

        canvas.width = img.offsetWidth;
        canvas.height = img.offsetHeight;
        
        const ctx = canvas.getContext('2d');
        
        // Capa plateada
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Texto
        ctx.fillStyle = '#666';
        ctx.font = 'bold 24px Poppins';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Ráspame", canvas.width / 2, canvas.height / 2);

        // 🔥 MOSTRAR IMAGEN (Ahora que está cubierta por la capa plateada)
        img.style.opacity = '1';
    }

    if (img.complete && img.offsetWidth > 0) setupCanvas();
    else img.onload = setupCanvas;

    // Lógica de raspado
    let isDrawing = false;
    const ctx = canvas.getContext('2d');

    const scratch = (e) => {
        if (!isDrawing) return;
        e.preventDefault(); // Evitar scroll en móvil
        const rect = canvas.getBoundingClientRect();
        const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

        ctx.globalCompositeOperation = 'destination-out'; // Borrar
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2); // Tamaño del pincel
        ctx.fill();
    };

    // Eventos Mouse y Touch
    ['mousedown', 'touchstart'].forEach(evt => canvas.addEventListener(evt, () => isDrawing = true));
    ['mouseup', 'touchend'].forEach(evt => canvas.addEventListener(evt, () => isDrawing = false));
    ['mousemove', 'touchmove'].forEach(evt => canvas.addEventListener(evt, scratch));
}

/* =========================
   EASTER EGG: FRASE SECRETA 🧩
   "Me haces super feliz gabriela resendiz gonzalez"
========================= */
const secretState = {
    me: false,
    haces: false,
    super: false,
    feliz: false,
    name: false // Se activa con el corazón
};

function checkSecretCompletion() {
    // Verificar si todas las claves del objeto son true
    const allFound = Object.values(secretState).every(val => val === true);
    
    if (allFound) {
        console.log("¡Frase secreta completada!");
        launchConfetti();
        setTimeout(() => {
            // Mostrar pantalla secreta
            const secretScreen = document.getElementById('secret-screen-content');
            if (secretScreen) {
                // Ocultar pantalla actual
                screens.forEach(s => s.classList.remove('active'));
                // Mostrar secreta
                secretScreen.classList.remove('hidden-screen');
                secretScreen.classList.add('active');
                secretScreen.style.display = "flex";
            }
        }, 1000);
    }
}

// 1. Lógica para las palabras (Me, Haces, Super, Feliz)
document.querySelectorAll('.secret-word').forEach(span => {
    span.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitar que abra modales si está dentro de una carta
        const wordKey = span.dataset.word; // 'me', 'haces', etc.

        // Si esa palabra YA fue encontrada, no hacemos nada (no se ilumina de nuevo)
        if (secretState[wordKey]) return;

        // Marcar como encontrada
        secretState[wordKey] = true;
        
        // Iluminar ESTE span específico
        span.classList.add('found');
        
        // Feedback visual (Confeti pequeño)
        launchConfetti();
        
        checkSecretCompletion();
    });
});

// 2. Lógica para el Nombre (Corazón en pantalla 8)
const finalHeart = document.getElementById('final-heart-trigger');
if (finalHeart) {
    finalHeart.addEventListener('click', () => {
        if (!secretState.name) {
            secretState.name = true;
            // Efecto visual en el corazón
            finalHeart.style.filter = "drop-shadow(0 0 15px #f472b6)";
            launchConfetti();
            checkSecretCompletion();
        }
    });
}

// 3. Botón para cerrar la pantalla secreta
const closeSecretBtn = document.getElementById('close-secret-screen');
if (closeSecretBtn) {
    closeSecretBtn.addEventListener('click', () => {
        const secretScreen = document.getElementById('secret-screen-content');
        secretScreen.classList.add('hidden-screen');
        secretScreen.classList.remove('active');
        secretScreen.style.display = "none";
        
        // Volver a la pantalla final (o donde estaba)
        changeScreen(currentScreen);
    });
}
