(function(){

    const settingsOverlay = document.getElementById("settings");
    const settingsButton = document.getElementById("settings-button");
    const leftWheelSpeedText = document.getElementById("left-wheel-speed-text");
    const rightWheelSpeedText = document.getElementById("right-wheel-speed-text");
    const leftWheelSpeedRange = document.getElementById("left-wheel-speed-range");
    const rightWheelSpeedRange = document.getElementById("right-wheel-speed-range");
    const saveSettingsButton = document.getElementById("save-settings-button");
    const abortSettingsButton = document.getElementById("abort-settings-button");

    const addEvents = function(text, range) {
        var value = text.value;
        var abortValue = value;
        const output = {
            value: value,
            updateAbortValue: function() {
                abortValue = value;
            },
            abort: function() {
                value = abortValue;
                range.value = value;
                text.value = value;
            }
        };
        text.addEventListener("change", function(a){
            const newValue = parseInt(this.value);
            if (newValue >= 0 && newValue < 256) {
                value = this.value;
                output.value = value;
                range.value = value;
            } else {
                this.value = value;
            }
        });
        range.addEventListener("input", function(a){
            value = this.value;
            output.value = value;
            text.value = value;
        });
        return output;
    }



    const left = addEvents(leftWheelSpeedText, leftWheelSpeedRange);
    const right = addEvents(rightWheelSpeedText, rightWheelSpeedRange);

    settingsButton.addEventListener("click", function(){
        settingsOverlay.style.display = "";
    });

    abortSettingsButton.addEventListener("click", function(){
        settingsOverlay.style.display = "none";
        left.abort();
        right.abort();
    });

    saveSettingsButton.addEventListener("click", function(){
        settingsOverlay.style.display = "none";
        left.updateAbortValue();
        right.updateAbortValue();
        socket.emit("wheelSpeed", [left.value, right.value]);
    });

})();