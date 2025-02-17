(function () {
    let widgetHTML = `
        <div id="tts-widget">
            <button id="tts-button">🔊</button>
            <div id="tts-modal" class="hidden">
                <div class="tts-container">
                    <span id="tts-close">&times;</span>
                    <h2>Text to Speech</h2>
                
                    <label for="tts-voice">Voice:</label>
                    <select id="tts-voice"></select>
                    <label for="tts-rate">Speed:</label>
                    <input type="range" id="tts-rate" min="0.5" max="2" step="0.1" value="1">
                    <label for="tts-pitch">Pitch:</label>
                    <input type="range" id="tts-pitch" min="0" max="2" step="0.1" value="1">
                    <div>
                        <button id="tts-speak">Speak</button>
                        <button id="tts-pause">Pause</button>
                        <button id="tts-resume">Resume</button>
                        <button id="tts-stop">Stop</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML("beforeend", widgetHTML);

    let modal = document.getElementById("tts-modal");
    let speech = new SpeechSynthesisUtterance();
    let synth = window.speechSynthesis;
    let voices = [];

    function populateVoices() {
        voices = synth.getVoices();
        let voiceSelect = document.getElementById("tts-voice");
        voiceSelect.innerHTML = "";
        voices.forEach(voice => {
            let option = document.createElement("option");
            option.textContent = `${voice.name} (${voice.lang})`;
            option.value = voice.name;
            voiceSelect.appendChild(option);
        });
    }

    document.getElementById("tts-button").addEventListener("click", function () {
        modal.classList.toggle("hidden");
        modal.style.display = modal.classList.contains("hidden") ? "none" : "block";
    });

    document.getElementById("tts-close").addEventListener("click", function () {
        modal.classList.add("hidden");
        modal.style.display = "none";
    });

    // Speak Selected or Full Text
    document.getElementById("tts-speak").addEventListener("click", function () {
        let selectedText = window.getSelection().toString().trim();

        if (selectedText) {
            speech.text = selectedText;
        } else {
            let pageText = document.body.innerText;
            let widgetText = document.getElementById("tts-modal").innerText;
            speech.text = pageText.replace(widgetText, "").trim();
        }

        speech.rate = document.getElementById("tts-rate").value;
        speech.pitch = document.getElementById("tts-pitch").value;
        let selectedVoice = document.getElementById("tts-voice").value;
        speech.voice = voices.find(voice => voice.name === selectedVoice);
        synth.speak(speech);
    });

    // Click to Start Speaking from That Word
    document.body.addEventListener("click", function (event) {
        if (event.target.closest("#tts-widget")) return; // Ignore clicks inside the widget

        let range = document.caretRangeFromPoint(event.clientX, event.clientY);
        if (!range || !range.startContainer || range.startContainer.nodeType !== Node.TEXT_NODE) return;

        let clickedText = range.startContainer.textContent;
        let offset = range.startOffset;

        // Extract text from clicked position onwards
        let remainingText = clickedText.substring(offset).trim();

        if (remainingText) {
            speech.text = remainingText;
            speech.rate = document.getElementById("tts-rate").value;
            speech.pitch = document.getElementById("tts-pitch").value;
            let selectedVoice = document.getElementById("tts-voice").value;
            speech.voice = voices.find(voice => voice.name === selectedVoice);
            synth.cancel(); // Stop previous speech
            synth.speak(speech);
        }
    });

    document.getElementById("tts-pause").addEventListener("click", () => synth.pause());
    document.getElementById("tts-resume").addEventListener("click", () => synth.resume());
    document.getElementById("tts-stop").addEventListener("click", () => synth.cancel());

    synth.onvoiceschanged = populateVoices;
    window.onload = populateVoices;
})();
