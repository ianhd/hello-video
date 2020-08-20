// class Video2 extends HTMLElement {
//     constructor()
// }

class Player {
    debug(msg) {
        document.getElementById("debug").innerHTML = `${msg} ${Date.now()}`;
    }
    constructor(elementId, options) {
        this.elementId = elementId;
        this.wrapper = document.getElementById(elementId);
        this.wrapper.id = `${elementId}`;
        this.audioOnlyClassName = "audioOnly";
        this.options = options;
        this.currentTime = 0;

        this.setBase64Images();
        this.createVideo();

        // set basic css rules
        this.wrapper.style = "position:relative;";
        this.video.style = "position:absolute;top:0;left:0;width:100%;";
        
        this.addControls();
        this.setSource(0);
        this.configVolume();
        this.configMultipleVideos();
        this.configVideoEvents();   
    }

    createVideo(){
        var video = document.createElement("video");
        video.setAttribute('crossOrigin', 'anonymous');
        video.setAttribute('playsinline', '');
        video.setAttribute('preload', 'metadata');
        video.setAttribute('poster', this.options.poster);
        if (this.options.autoplay)
            video.setAttribute('autoplay', '');
        this.video = video;
        this.wrapper.appendChild(this.video);
    }

    configVideoEvents(){
        var that = this;
        // loadedmetadata - set height of controls, which we don't know until video's meta data has loaded
        var controlWrapper = document.getElementById(`${this.elementId}-controls`);
        var durationCtrl = controlWrapper.querySelector(`[data-text='duration']`);
        this.video.addEventListener("loadedmetadata", function(e) {
            that.debug("loadedmetadata");
            var videoHeight = e.currentTarget.offsetHeight;
            controlWrapper.style.height = videoHeight + "px";
            that.wrapper.style.height = videoHeight + "px"; // for good measure, also set height of wrapping div around this whole thing
            durationCtrl.innerHTML = that.timeToFriendly(e.currentTarget.duration);
        }, false);  

        this.video.addEventListener("play", function(){
            that.debug("play");
            that.pauseButton.style.display = 'inline-block';
            that.playButton.style.display = 'none'; 
            that.showLoadingIconIfNeeded();
        });

        this.video.addEventListener("pause", function(){
            that.debug("pause");
            that.pauseButton.style.display = 'none';
            that.playButton.style.display = 'inline-block';
        });

        //configProgress
        var currentTimeCtrl = this.wrapper.querySelector(`[data-text='currentTime']`);
        this.video.addEventListener("timeupdate", function(e) {
            that.debug('timeupdate');

            // video is currently PLAYING, so adjust controls accordingly
            if (that.loading) {
                that.hideControls();
                that.loading = false;
                that.playedAtLeastOnce = true;
                that.pauseButton.style.display = 'inline-block';
                that.playButton.style.display = 'none';
                that.rewindButton.style.display = 'inline-block';
                that.fastForwardButton.style.display = 'inline-block';
                that.loadingIcon.style.display = 'none';                 
            }
            
            // TODO: do we really need to have the following if condition check?
            if (that.video.currentTime && that.video.duration){
                currentTimeCtrl.innerHTML = that.timeToFriendly(e.currentTarget.currentTime);

                that.currentTime = that.video.currentTime;
                var progressInPercentage = that.video.currentTime /  that.video.duration * 100;
    
                that.progressBar.value = progressInPercentage;
                that.updateProgressBar(progressInPercentage);
            }
        });
    }

    updateProgressBar(percent) {
        var inputRangeForegroundColor = 'white';
        var inputRangeBackgroundColor = '#CCC';
        this.progressBar.style.backgroundImage = `-webkit-gradient(linear, left top, right top, color-stop(${percent}%, ${inputRangeForegroundColor}), color-stop(${percent}%, ${inputRangeBackgroundColor}))`;
        this.progressBar.style.backgroundImage = `-moz-linear-gradient(left center, ${inputRangeForegroundColor} 0%, ${inputRangeBackgroundColor} ${percent}%, ${inputRangeBackgroundColor} ${percent}%, ${inputRangeBackgroundColor} 100%)`;
    }  
    // updateState(state) {
    //     switch(state) {
    //         case "loading":
    //             break;
    //         case "playing":
    //             break;
    //         case "paused":
    //             break;
    //     }
    // }    
    displayControls() {
        if (this.isAudioMode()) return;

        this.addClassToWrapper("hover");
        if (this.timeoutId) clearTimeout(this.timeoutId); // clear any previous timeout
        this.timeoutId = setTimeout(() => {
            if (this.loading) return; // if this is loading, continue to display the loading icon
            this.hideControls();
        }, 2500);
    }
    addClassToWrapper(className){
        this.wrapper.classList.add(className);
    }

    removeClassFromWrapper(className){
        this.wrapper.classList.remove(className);
    }

    isAudioMode(){
        return this.wrapper.classList.contains(this.audioOnlyClassName);
    }

    hideControls() {
        if (this.timeoutId) clearTimeout(this.timeoutId); // clear any previous timeout
        this.removeClassFromWrapper("hover");
    }
    setSource(index) {
        var source = this.options.sources[index];
        this.video.setAttribute("src", source.src);

        if (source.mp3Url){
            this.audioOnlyButton.style.visibility = "visible";
            this.audioSource.src = source.mp3Url;
            this.audio.load();  

        }else{
            this.audioOnlyButton.style.visibility = "hidden";
        }
    }
    isMobile() {
        return window.matchMedia("only screen and (max-width: 760px)").matches;
    }
    timeToFriendly(time) {
        var hrs = ~~(time / 3600);
        var mins = ~~((time % 3600) / 60);
        var secs = ~~time % 60;
    
        // Output like "1:01" or "4:03:59" or "123:03:59"
        var ret = "";
    
        if (hrs > 0) {
            ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
        }
    
        ret += "" + mins + ":" + (secs < 10 ? "0" : "");
        ret += "" + secs;
        return ret;
    }
    configVolume() {
        // set vol
        this.video.volume = 1.0;
        // show/hide vol controls based on if we have mute or not mute

        if (this.video.volume) { // we have volume!
            this.wrapper.querySelector("[data-action='mute']").style.display = 'inline-block';
            return;
        } 
        // video is muted
        this.wrapper.querySelector("[data-action='unMute']").style.display = 'none';
    }
    configMultipleVideos() {
        var multipleVideos = this.options.sources.length > 1;
        if (!multipleVideos) return;
        
        var skipText = (this.isMobile() ? this.options.skipTextMobile : this.options.skipText) || "SKIP";
        this.wrapper.insertAdjacentHTML('beforeend', `
            <div id="${this.elementId}-skip" style="cursor:default;color: white;font-size:13px;position:absolute;bottom:40px;right:20px;padding:10px 12px 9px 12px;background:#333;border-radius:3px;">
                <span style="display:inline-block;float:left;margin-right:8px;">${skipText}</span><img style="width:15px;margin-top:2px" src="https://content.swncdn.com/videoplayer/next_white.svg?v=1" />
            </div>
        `);

        var that = this;
        document.getElementById(`${this.elementId}-skip`).addEventListener("click", (event) => {
            that.setSource(1);
            event.currentTarget.style.display = 'none';
            
            this.playedAtLeastOnce = false;
            that.video.play();
        });
    }

    addControls() {
        var that = this;
        this.wrapper.insertAdjacentHTML('beforeend', `
            <style>
                [data-action] { cursor: pointer; }
                #${this.elementId}-controls { transition: background .25s ease-in-out }
                #${this.elementId}.hover #${this.elementId}-controls { background:rgba(0,0,0,.3); }
                #${this.elementId}-controls .op-0 { opacity:0; transition: opacity .25s ease-in-out; }
                #${this.elementId}.hover #${this.elementId}-controls .op-0 { opacity:0.5; }
                #${this.elementId}.hover #${this.elementId}-controls [data-action]:hover,
                #${this.elementId}.hover #${this.elementId}-controls .seekContainer:hover span { opacity:0.9; }   
                .mr-a { margin-right: auto; }
                .ml-a { margin-left: auto; }
                .mx-30 { margin-left: 30px; margin-right: 30px; }
                .mainControls { display:flex; top: 50%; position: absolute; left: 50%; margin-top: -30px; margin-left: -116px; }
                .goBackToVideo { display: none; }
                .mainControls img { flex:1; max-width:60px; max-height:60px; }
                .mainControls .seekContainer { position: relative; }
                .mainControls .seekContainer span { position: absolute; top: 22px; left: 18px; color: white; }
                .upperRight { position:absolute;top:20px;right:20px; }
                .upperRight img { display:inline-block;margin-left:20px; }
                .bottom { width:100%; display:flex; padding: 0 10px 0 10px; position: absolute; bottom:15px; left:0; color: white;}
                .bottom .progressBar { align-self: center; flex-grow: 2;  -webkit-appearance: none; -moz-apperance: none; border-radius: 10px; height: 8px; background-image: -webkit-gradient(linear, left top, right top, color-stop(0%, white), color-stop(0%, #CCC)); background-image: -moz-linear-gradient(left center, white 0%, white 0%, #CCC 0%, #CCC 100%);}
                .bottom .progressBar::-moz-range-track { border: none; background: none; outline: none; }
                .bottom .progressBar:focus { outline: none; border: none; }
                .bottom .progressBar::-webkit-slider-thumb { -webkit-appearance: none !important; background-color: white; height: 13px; width: 13px; border-radius: 50%; }
                .bottom .progressBar::-moz-range-thumb { -moz-appearance: none !important; background-color: white; border: none; height: 13px; width: 13px; border-radius: 50%; }
                .bottom audio { display: none; }
                @-webkit-keyframes rotation {
                    from { -webkit-transform: rotate(0deg); }
                    to { -webkit-transform: rotate(359deg); }
                }
                #${this.elementId}.audioOnly { background-image: url("${this.options.poster}"); background-repeat: round;}
                .audioOnly .bottom * { display: none; }
                .audioOnly .bottom audio { display: block; width: 100%; }
                .audioOnly video { display: none; }
                .audioOnly audio { outline-width: 0; }
                .audioOnly .goBackToVideo { display: block; }
                .audioOnly .goBackToVideo .container { width: 58%; padding: 10px 15px 15px 15px; margin: 0 auto; margin-top: 8%; text-align: center; background: rgba(0,0,0,0.6); color: white; padding-bottom: 20px; border-radius: 5px;  }
                .audioOnly .goBackToVideo .container .audioOnlyIcon { height: 80px; }
                .audioOnly .goBackToVideo .container .goBackToVideoButton { margin-top: 30px; }
                .audioOnly .goBackToVideo .container .goBackToVideoButton .goBackToVideoIcon { height: 20px; }
                .audioOnly .goBackToVideo .container .goBackToVideoButton span { margin-left: 10px; position: relative; top: -4px; }
                .audioOnly .mainControls { display: none; } 

                @media only screen and (max-width: 768px) {
                    .audioOnly .goBackToVideo .container { width: 90%; margin-top: 40px; }
                    .audioOnly .goBackToVideo .container .goBackToVideoButton { margin-top: 15px; }
                    .audioOnly .goBackToVideo .container .audioOnlyIcon { display: none; } 
                }
            </style>
            <div id="${this.elementId}-controls">
                <div class="mainControls">
                    <div class='seekContainer' id="${this.elementId}-rewind-button"><span class="op-0">10</span><img data-action="rewind" class="ml-a op-0" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODUiIHZpZXdCb3g9IjAgMCA4MCA4NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+MTBzIGJhY2s8L3RpdGxlPjxwYXRoIGQ9Ik0xNS4xOTcgMTQuNDc4bDMuMjY4IDEuNzUzQzkuNDk1IDIyLjc5IDMuNjYyIDMzLjM4NyAzLjY2MiA0NS4zNTJjMCAxOS45MTMgMTYuMTQzIDM2LjA1NiAzNi4wNTYgMzYuMDU2IDE5LjkxNCAwIDM2LjA1Ny0xNi4xNDMgMzYuMDU3LTM2LjA1NiAwLTE4LjI0LTEzLjU0Ny0zMy4zMDgtMzEuMTI3LTM1LjcxM3Y0Ljg2OHMuMDA4Ljk2OC0uMzA1IDEuMTAzYy0uNDI1LjE4My0xLjA0LS4yMjQtMS4wNC0uMjI0TDMxLjQyOCA5LjA0OXMtLjgxOC0uMzg2LS44MTgtLjc0YzAtLjQyMi44MTYtLjc5Ny44MTYtLjc5N0w0My42Ljg5OHMuMzY4LS4yNjQuNzcyLS4wNDhjLjI5LjE1NC4yNzYuODIzLjI3Ni44MjNWNi4yNGMxOS40NTEgMi40MjcgMzQuNTA3IDE5LjAwNCAzNC41MDcgMzkuMTEzIDAgMjEuNzgtMTcuNjU2IDM5LjQzNy0zOS40MzcgMzkuNDM3LTIxLjc4IDAtMzkuNDM2LTE3LjY1Ny0zOS40MzYtMzkuNDM3IDAtMTIuNTEgNS44My0yMy42NSAxNC45MTUtMzAuODc0IiBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4="></div>
                    <img id="${this.elementId}-play-button" data-action="play" data-toggle-action="pause" class="mx-30 op-0" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgdmlld0JveD0iMCAwIDkwIDkwIj48cGF0aCBmaWxsPSIjRkZGIiBkPSJNODguMTY0IDQyLjc2MWMyLjQ0NyAxLjIzNyAyLjQ0NyAzLjI0MSAwIDQuNDc4TDQuNDM0IDg5LjUxNEMxLjk4NSA5MC43NSAwIDg5LjU0NyAwIDg2LjgzVjMuMTY5QzAgLjQ1IDEuOTg1LS43NTEgNC40MzQuNDg2bDgzLjczIDQyLjI3NXoiLz48L3N2Zz4=">
                    <img id="${this.elementId}-loading-icon" style="display:none;width:90px; -webkit-animation: rotation 1.25s infinite linear;" class="mx-30 op-0 loading" src="data:image/svg+xml;base64,${this.loadingIconBase64}">
                    <img id="${this.elementId}-pause-button" data-action="pause" data-toggle-action="play" style="display:none;width:90px;" class="mx-30 op-0" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3NSIgaGVpZ2h0PSI5NSIgdmlld0JveD0iMCAwIDc1IDk1Ij48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMCAwaDI1djk1SDB6TTUwIDBoMjV2OTVINTB6Ii8+PC9zdmc+">
                    <div class='seekContainer' id="${this.elementId}-fast-forward-button"><span class="op-0">10</span><img data-action="fastForward" class="mr-a op-0" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODUiIHZpZXdCb3g9IjAgMCA4MCA4NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+MTBzIGZvcndhcmQ8L3RpdGxlPjxwYXRoIGQ9Ik02NC4yNCAxNC40NzhsLTMuMjY5IDEuNzUzYzguOTcyIDYuNTU5IDE0LjgwNCAxNy4xNTYgMTQuODA0IDI5LjEyMSAwIDE5LjkxMy0xNi4xNDMgMzYuMDU2LTM2LjA1NyAzNi4wNTYtMTkuOTEzIDAtMzYuMDU2LTE2LjE0My0zNi4wNTYtMzYuMDU2IDAtMTguMjQgMTMuNTQ3LTMzLjMwOCAzMS4xMjctMzUuNzEzdjQuODY4cy0uMDA4Ljk2OC4zMDUgMS4xMDNjLjQyNS4xODMgMS4wNC0uMjI0IDEuMDQtLjIyNEw0OC4wMSA5LjA0OXMuODE4LS4zODYuODE4LS43NGMwLS40MjItLjgxNy0uNzk3LS44MTctLjc5N0wzNS44MzcuODk4cy0uMzY5LS4yNjQtLjc3Mi0uMDQ4Yy0uMjkuMTU0LS4yNzYuODIzLS4yNzYuODIzVjYuMjRDMTUuMzM3IDguNjY2LjI4MiAyNS4yNDMuMjgyIDQ1LjM1MmMwIDIxLjc4IDE3LjY1NiAzOS40MzcgMzkuNDM2IDM5LjQzN3MzOS40MzctMTcuNjU3IDM5LjQzNy0zOS40MzdjMC0xMi41MS01LjgzMS0yMy42NS0xNC45MTUtMzAuODc0IiBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4="></div>
                </div>
                <div class="goBackToVideo">
                    <div class="container">
                        <img class="audioOnlyIcon" src="data:image/svg+xml;base64,${this.audioOnlyButtonBase64}" /> 
                        <div class="nowPlaying">Now playing audio version of this video.</div>   
                        <div data-action="goBackToVideo" class="goBackToVideoButton">
                            <img class="goBackToVideoIcon" src="data:image/svg+xml;base64,${this.goBackArrowBase64}" />   
                            <span>Switch back to video</span>
                        </div> 
                    </div>
                </div>
                <div class="upperRight">
                    <img id="${this.elementId}-audioOnly-button" data-action="audioOnly" title="Audio Only" class="op-0" style="height:50px; margin-top:-16px; float: left; visibility: hidden" src="data:image/svg+xml;base64,${this.audioOnlyButtonBase64}">
                    <img data-action="mute" data-toggle-action="unMute" style="display:none;" class="op-0" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMjUiIHZpZXdCb3g9IjAgMCAzNCAyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+dm9sdW1lXzNiYXJzPC90aXRsZT48ZyBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik02Ljg0OCA2LjMwNkgxLjcyQy4yMTEgNi4zMDYgMCA2LjUxMSAwIDcuOTc3djkuMDQ1YzAgMS40NjYuMjExIDEuNjcyIDEuNzIgMS42NzJoNS4xM2w4LjcwMiA2LjAwNmMuNzk5LjU5MiAxLjQ0OC4yOCAxLjQ0OC0uNjk3Vi45OTdjMC0uOTc3LS42NS0xLjI5LTEuNDQ5LS42OTdMNi44NDggNi4zMDZ6TTMxLjYyNyAxMi40YzAgMy45NDEtMS43MTggNy40NzctNC40NDYgOS45NTNsMS4wOTUuODQ2QzMxLjE3OCAyMC40ODUgMzMgMTYuNjU3IDMzIDEyLjRzLTEuODIyLTguMDg1LTQuNzI1LTEwLjhsLTEuMDk1Ljg0OGMyLjcyOCAyLjQ3NSA0LjQ0NyA2LjAxMSA0LjQ0NyA5Ljk1MnpNMjMuMzg4IDEyLjRhOC4wMSA4LjAxIDAgMCAxLTIuMDg4IDUuMzlsMS4wOC44MzdhOS4zNTUgOS4zNTUgMCAwIDAgMi4zODEtNi4yMjggOS4zNSA5LjM1IDAgMCAwLTIuMzgxLTYuMjI4bC0xLjA4LjgzN2E4LjAyIDguMDIgMCAwIDEgMi4wODggNS4zOTF6Ii8+PHBhdGggZD0iTTI3LjUwOCAxMi40YzAgMy4wMDQtMS4yNDQgNS43MjMtMy4yNDkgNy42ODVsMS4wODMuODRjMi4xODYtMi4xOTYgMy41MzgtNS4yMDQgMy41MzgtOC41MjUgMC0zLjMyLTEuMzUyLTYuMzMtMy41MzgtOC41MjZsLTEuMDgzLjg0MmExMC43MTQgMTAuNzE0IDAgMCAxIDMuMjUgNy42ODR6Ii8+PC9nPjwvc3ZnPg==">
                    <img data-action="unMute" data-toggle-action="mute" style="display:none;" class="op-0" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMjUiIHZpZXdCb3g9IjAgMCAzNCAyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+dm9sdW1lX211dGU8L3RpdGxlPjxnIGZpbGw9IiNGRkYiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0iTTYuODQ4IDYuMzA2SDEuNzJDLjIxMSA2LjMwNiAwIDYuNTExIDAgNy45Nzd2OS4wNDVjMCAxLjQ2Ni4yMTEgMS42NzIgMS43MiAxLjY3Mmg1LjEzbDguNzAyIDYuMDA2Yy43OTkuNTkyIDEuNDQ4LjI4IDEuNDQ4LS42OTdWLjk5N2MwLS45NzctLjY1LTEuMjktMS40NDktLjY5N0w2Ljg0OCA2LjMwNnoiLz48cGF0aCBkPSJNMzMuMDg0IDcuODhsLTEuNDIyLTEuNDIyLTQuNjE5IDQuNjItNC42Mi00LjYyTDIxIDcuODhsNC42MiA0LjYxOS00LjYyIDQuNjIgMS40MjIgMS40MjMgNC42MjEtNC42MiA0LjYyIDQuNjIgMS40MjEtMS40MjItNC42MTgtNC42MjEgNC42MTgtNC42MTl6IiBvcGFjaXR5PSIuNCIvPjwvZz48L3N2Zz4=">
                    <img data-action="fullScreen" class="op-0" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iMjUiIHZpZXdCb3g9IjAgMCAyNSAyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+ZnVsbHNjcmVlbjwvdGl0bGU+PGcgZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMjQuOTY5LjAwMlYwaC0zdi4wMDJsLTYtLjAwMnYzaDMuNzU0bC01Ljg3MSA1Ljg3MSAyLjEyMSAyLjEyMSA1Ljk5Ni01Ljk5NlY5aDNWLjAwMnpNOSAyMkg1LjI0Nmw1Ljg3MS01Ljg3MS0yLjEyMS0yLjEyMUwzIDIwLjAwNFYxNkgwdjloOXYtM3oiLz48L2c+PC9zdmc+">                
                </div>
                <div class="bottom">
                    <audio id="${this.elementId}-audio" controls>
                        <source id="${this.elementId}-audio-source" src="" type="audio/mpeg"></source>
                        Your browser does not support the audio format.
                    </audio>
                    <span data-text="currentTime" class="op-0">0:00</span>
                    <input type="range" class="progressBar op-0" min="0.01" max="100" step="0.01" value="0.01" />
                    <span data-text="duration" class="op-0"></span>
                </div>
            </div>
        `)

        var controlWrapper = document.getElementById(`${this.elementId}-controls`);
        var controls = controlWrapper.querySelectorAll("[data-action]");
        controls.forEach(ctrl => {
            ctrl.addEventListener("click", (event) => {
                var button = event.currentTarget;
                var action = button.getAttribute("data-action"); // play | rewind | fastForward | pause | volume | fullScreen
                
                switch(action) {
                    case "play":
                        this.video.play();
                        break;
                    case "pause":
                        this.video.pause();
                        break;
                    case "rewind":
                    case "fastForward":
                        var adjustBy = action == "rewind" ? -10 : 10;
                        var newTime = this.video.currentTime + adjustBy;
                        if (newTime < 0) newTime = 0;
                        else if (newTime > this.video.duration) newTime = audio.duration; // POTENTIAL ERROR - do we have to wait until "loadedmetadata" to get duration?
                        this.video.currentTime = newTime;
                        break;
                    case "fullScreen":
                        if (this.video.mozRequestFullScreen) {
                            this.video.mozRequestFullScreen();
                        } else if (this.video.webkitRequestFullScreen) {
                            this.video.webkitRequestFullScreen();
                        }                          
                        break;
                    case "mute":
                    case "unMute":
                        this.swapControls(button);
                        if (this.video.volume) { // volume is On, so turn it off
                            this.video.volume = 0;
                        } else {
                            this.video.volume = 1.0;
                        }
                        break;
                    case "audioOnly":
                        that.updateBackgroundImageToScreenshot();
                        that.video.pause();
                        that.hideControls();
                        that.addClassToWrapper(this.audioOnlyClassName);
                        that.audio.currentTime = that.currentTime;
                        that.audio.play();                       
                        break;
                    case "goBackToVideo":
                        that.audio.pause();
                        that.removeClassFromWrapper(this.audioOnlyClassName);
                        that.video.currentTime = that.currentTime;
                        that.video.play();                 
                        break;
                    default:
                        throw "Player control not supported: " + action;
                }
            });
        });

        this.wrapper.onmouseover = function(e) {
            that.displayControls();
        };
        this.wrapper.onmouseout = function(e) {
            //that.hideControls();
            //that.debug('onmouseout ' + e.currentTarget.id);
        };        
        this.wrapper.addEventListener("touchstart", function(e) {
            that.displayControls();
            //that.debug('touchstart ' + e.currentTarget.id);
        },  {passive: true});  

        this.progressBar = this.wrapper.getElementsByClassName('progressBar')[0];
        this.progressBar.addEventListener("input", () => {
            var val = (that.progressBar.value - that.progressBar.min) / (that.progressBar.max - that.progressBar.min);
            var percent = val * 100;

            that.updateProgressBar(percent);

            var newCurrentTime = percent * that.video.duration / 100;
            that.video.currentTime = newCurrentTime;
        });

        this.pauseButton = document.getElementById(this.elementId+ '-pause-button');
        this.playButton = document.getElementById(this.elementId+ '-play-button');
        this.fastForwardButton = document.getElementById(this.elementId+ '-fast-forward-button');
        this.rewindButton = document.getElementById(this.elementId+ '-rewind-button');
        this.loadingIcon = document.getElementById(this.elementId+ '-loading-icon');
        this.audio = document.getElementById(this.elementId + '-audio');
        this.audioSource = document.getElementById(this.elementId + '-audio-source');
        this.audioOnlyButton = document.getElementById(this.elementId+ '-audioOnly-button');

        this.audio.addEventListener("timeupdate", function(){
            that.currentTime = that.audio.currentTime;
        });
    }
    swapControls(triggerEl) {
        var toggleAction = triggerEl.getAttribute("data-toggle-action"); // play | pause                                            
        var ctrlToToggle = document.getElementById(`${this.elementId}-controls`).querySelector(`[data-action='${toggleAction}']`);        
        ctrlToToggle.style.display = "inline-block";
        triggerEl.style.display = "none";        
    }

    showLoadingIconIfNeeded(){
        if (!this.playedAtLeastOnce){
            this.loading = true;
            this.pauseButton.style.display = 'none';
            this.playButton.style.display = 'none';
            this.rewindButton.style.display = 'none';
            this.fastForwardButton.style.display = 'none';
            this.loadingIcon.style.display = 'inline-block';
        }
    }

    setBase64Images(){
        this.goBackArrowBase64 = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pg0KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE4LjEuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgNDkuNDk5IDQ5LjQ5OSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDkuNDk5IDQ5LjQ5OTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGc+DQoJPHBhdGggc3R5bGU9ImZpbGw6I0ZGRkZGRjsiIGQ9Ik04LjE0MywxMC44MDRDNy40NzMsMTEuNjgyLDcsMTEuODQyLDcsMTEuMDk5VjkuNzUxYzAtMS45MzMtMS41NjctMy41LTMuNS0zLjVTMCw3LjgxOCwwLDkuNzUxdjEyDQoJCWMwLDEuOTMzLDEuNTY3LDMuNSwzLjUsMy41aDEyYzEuOTMzLDAsMy41LTEuNTY3LDMuNS0zLjVzLTEuNTY3LTMuNS0zLjUtMy41YzAsMC0wLjU3OSwwLTEuMjk0LDBzLTAuOTE2LTAuODE3LTAuMzEtMS43NA0KCQljMi43NTItNC4xODcsNy40Ny02Ljc5NSwxMi41NjktNi43OTVjOC4yOSwwLDE1LjAzNCw2Ljc0NCwxNS4wMzQsMTUuMDM0YzAsOC4yODktNi43NDQsMTUuMDMzLTE1LjAzNCwxNS4wMzNjLTIuMjA5LDAtNCwxLjc5MS00LDQNCgkJczEuNzkxLDQsNCw0YzEyLjcwMSwwLjAwMSwyMy4wMzQtMTAuMzMyLDIzLjAzNC0yMy4wMzJjMC0xMi43MDEtMTAuMzMzLTIzLjAzNC0yMy4wMzQtMjMuMDM0DQoJCUMxOS4yMDQsMS43MTYsMTIuNDQ1LDUuMTY3LDguMTQzLDEwLjgwNHoiLz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjxnPg0KPC9nPg0KPGc+DQo8L2c+DQo8Zz4NCjwvZz4NCjwvc3ZnPg0K";
        this.loadingIconBase64 = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI0LjAuMywgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjQgMjQ7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbDpub25lO30KCS5zdDF7ZmlsbDojRkZGRkZGO30KCS5zdDJ7b3BhY2l0eTowLjQ0O2ZpbGw6I0ZGRkZGRjtlbmFibGUtYmFja2dyb3VuZDpuZXcgICAgO30KCS5zdDN7b3BhY2l0eTowLjkzO2ZpbGw6I0ZGRkZGRjt9Cgkuc3Q0e29wYWNpdHk6MC4zNztmaWxsOiNGRkZGRkY7ZW5hYmxlLWJhY2tncm91bmQ6bmV3ICAgIDt9Cgkuc3Q1e29wYWNpdHk6MC43OTtmaWxsOiNGRkZGRkY7ZW5hYmxlLWJhY2tncm91bmQ6bmV3ICAgIDt9Cgkuc3Q2e29wYWNpdHk6MC4yMztmaWxsOiNGRkZGRkY7ZW5hYmxlLWJhY2tncm91bmQ6bmV3ICAgIDt9Cgkuc3Q3e29wYWNpdHk6MC42NTtmaWxsOiNGRkZGRkY7ZW5hYmxlLWJhY2tncm91bmQ6bmV3ICAgIDt9Cgkuc3Q4e29wYWNpdHk6OS4wMDAwMDBlLTAyO2ZpbGw6I0ZGRkZGRjtlbmFibGUtYmFja2dyb3VuZDpuZXcgICAgO30KCS5zdDl7b3BhY2l0eTowLjUxO2ZpbGw6I0ZGRkZGRjtlbmFibGUtYmFja2dyb3VuZDpuZXcgICAgO30KCS5zdDEwe29wYWNpdHk6MDtmaWxsOiNGRkZGRkY7ZW5hYmxlLWJhY2tncm91bmQ6bmV3ICAgIDt9Cgkuc3QxMXtvcGFjaXR5OjAuNzI7ZmlsbDojRkZGRkZGO2VuYWJsZS1iYWNrZ3JvdW5kOm5ldyAgICA7fQoJLnN0MTJ7b3BhY2l0eTowLjE2O2ZpbGw6I0ZGRkZGRjtlbmFibGUtYmFja2dyb3VuZDpuZXcgICAgO30KCS5zdDEze29wYWNpdHk6MC44NjtmaWxsOiNGRkZGRkY7ZW5hYmxlLWJhY2tncm91bmQ6bmV3ICAgIDt9Cgkuc3QxNHtvcGFjaXR5OjAuMztmaWxsOiNGRkZGRkY7ZW5hYmxlLWJhY2tncm91bmQ6bmV3ICAgIDt9Cgkuc3QxNXtvcGFjaXR5OjAuNTg7ZmlsbDojRkZGRkZGO2VuYWJsZS1iYWNrZ3JvdW5kOm5ldyAgICA7fQoJLnN0MTZ7b3BhY2l0eToyLjAwMDAwMGUtMDI7ZmlsbDojRkZGRkZGO2VuYWJsZS1iYWNrZ3JvdW5kOm5ldyAgICA7fQo8L3N0eWxlPgo8cmVjdCBjbGFzcz0ic3QwIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiLz4KPGNpcmNsZSBjbGFzcz0ic3QxIiBjeD0iMTIiIGN5PSIzIiByPSIxLjIiLz4KPGNpcmNsZSBjbGFzcz0ic3QyIiBjeD0iMTIiIGN5PSIyMSIgcj0iMS4yIi8+CjxjaXJjbGUgY2xhc3M9InN0MyIgY3g9IjguNCIgY3k9IjMuNyIgcj0iMS4yIi8+CjxjaXJjbGUgY2xhc3M9InN0NCIgY3g9IjE1LjYiIGN5PSIyMC4zIiByPSIxLjIiLz4KPGNpcmNsZSBjbGFzcz0ic3Q1IiBjeD0iMy42IiBjeT0iOC43IiByPSIxLjIiLz4KPGNpcmNsZSBjbGFzcz0ic3Q2IiBjeD0iMjAuNCIgY3k9IjE1LjMiIHI9IjEuMiIvPgo8Y2lyY2xlIGNsYXNzPSJzdDciIGN4PSIzLjciIGN5PSIxNS42IiByPSIxLjIiLz4KPGNpcmNsZSBjbGFzcz0ic3Q4IiBjeD0iMjAuMyIgY3k9IjguNCIgcj0iMS4yIi8+CjxjaXJjbGUgY2xhc3M9InN0OSIgY3g9IjguNyIgY3k9IjIwLjQiIHI9IjEuMiIvPgo8Y2lyY2xlIGNsYXNzPSJzdDEwIiBjeD0iMTUuMyIgY3k9IjMuNiIgcj0iMS4zIi8+CjxjaXJjbGUgY2xhc3M9InN0MTEiIGN4PSIzIiBjeT0iMTIiIHI9IjEuMiIvPgo8Y2lyY2xlIGNsYXNzPSJzdDEyIiBjeD0iMjEiIGN5PSIxMiIgcj0iMS4yIi8+CjxjaXJjbGUgY2xhc3M9InN0MTMiIGN4PSI1LjYiIGN5PSI1LjYiIHI9IjEuMiIvPgo8Y2lyY2xlIGNsYXNzPSJzdDE0IiBjeD0iMTguNCIgY3k9IjE4LjQiIHI9IjEuMiIvPgo8Y2lyY2xlIGNsYXNzPSJzdDE1IiBjeD0iNS42IiBjeT0iMTguNCIgcj0iMS4yIi8+CjxjaXJjbGUgY2xhc3M9InN0MTYiIGN4PSIxOC40IiBjeT0iNS42IiByPSIxLjIiLz4KPC9zdmc+Cg==";
        this.audioOnlyButtonBase64 = "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIxLjEuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMTAwIDExMDAiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDExMDAgMTEwMDsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8Zz4KCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik03NTIuMiw1NzQuNmgtMTkuNmMtOC41LDAtMTUuNSw3LTE1LjUsMTUuNXYyOTYuOWMwLDguNSw3LDE1LjUsMTUuNSwxNS41aDE5LjZjOC41LDAsMTUuNS03LDE1LjUtMTUuNVY1OTAuMQoJCUM3NjcuNyw1ODEuNiw3NjAuNyw1NzQuNiw3NTIuMiw1NzQuNnoiLz4KCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik05MDIuMSw2NDkuMVY2NDFjMC05LTMuMS0xNy40LTguNC0yNC43di01My44Yy0xLjItNDcuMy0xMC4xLTkwLjgtMjUuMS0xMjkuOGw0LjctMi41YzYuNS0zLjUsOS0xMS40LDUuOC0xOGwtMy4yLTYuNgoJCWwtNS40LTExYy0zMC44LTYxLjktNzgtMTEyLjktMTM2LjktMTQ3Ljd2LTAuMWwtMTUuNi04LjhsLTAuMiwwLjJjLTUwLjktMjYuNy0xMDcuOS00MC43LTE2NS42LTQwLjcKCQljLTU5LjQsMC0xMTUuMiwxMy42LTE2NS45LDQwLjRsLTAuMS0wLjFsLTQuNiwyLjdjLTAuNywwLjQtMTAuOCw2LTEwLjgsNnYwLjNjLTU4LjEsMzQuNy0xMDUuMiw4NS45LTEzNi4zLDE0OC41bC01LjQsMTFsLTMsNS45CgkJYy0zLjMsNi42LTAuOCwxNC42LDUuNywxOC4xbDQuNiwyLjVjLTE1LjYsNDAuMS0yNC42LDgzLjgtMjUuNywxMjkuN2gwLjF2NDguNmMtOCw4LjMtMTIuNywxOC42LTEyLjcsMjkuOHY4LjIKCQljLTE0LjYsNS45LTI3LjksMTUtMjcuOSwyNS4zdjEyOC40YzAsMTAuNCwxMy4zLDE5LjUsMjcuOSwyNS4zdjguMWMwLDI3LjQsMjguNCw0OS44LDYzLjYsNDkuOGgyNC42YzgsMCwxNC41LTYuNSwxNC41LTE0LjVWNjA1LjcKCQljMC04LTYuNS0xNC41LTE0LjUtMTQuNWgtMjQuNmMtNi45LDAtMTMuNiwwLjktMTkuOCwyLjV2LTMxLjJjMS4xLTQwLjYsOC42LTc5LjMsMjEuOC0xMTVsMS42LDAuOWM3LDMuOCwxNS43LDAuOCwxOC45LTYuNAoJCWw0LjEtOS4yYzIzLTUxLjQsNTguNS05NC40LDEwMi43LTEyNC44bDYuMS0zLjljNDYuNS0zMC4xLDk4LjctNDUuNCwxNTUuMS00NS40YzU2LjQsMCwxMDguNiwxNS4zLDE1NSw0NS40bDUuNSwzLjYKCQljNDQuNiwzMC40LDgwLjIsNzMuNiwxMDMuMywxMjUuMmw0LjEsOS4yYzMuMiw3LjIsMTEuOSwxMC4yLDE4LjksNi41bDEuNy0wLjljMTMuMSwzNS43LDIwLjcsNzQuNCwyMS44LDExNXYzMi40CgkJYy03LjUtMi40LTE1LjctMy44LTI0LjMtMy44aC0yNC43Yy04LDAtMTQuNSw2LjUtMTQuNSwxNC41djI2Ni42YzAsOCw2LjUsMTQuNSwxNC41LDE0LjVoMjQuN2MzNS4zLDAsNjMuOC0yMi4zLDYzLjgtNDkuOXYtOC44CgkJYzE0LjYtNS44LDI3LjktMTQuOSwyNy45LTI1LjRWNjc0LjRDOTMwLDY2NC4xLDkxNi43LDY1NSw5MDIuMSw2NDkuMXoiLz4KCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0zNjYuNSw1NzQuNkgzNDdjLTguNSwwLTE1LjUsNy0xNS41LDE1LjV2Mjk2LjljMCw4LjUsNywxNS41LDE1LjUsMTUuNWgxOS41YzguNSwwLDE1LjUtNywxNS41LTE1LjVWNTkwLjEKCQlDMzgyLDU4MS42LDM3NSw1NzQuNiwzNjYuNSw1NzQuNnoiLz4KPC9nPgo8L3N2Zz4K"
    }

    updateBackgroundImageToScreenshot(){
        var setBackground = (url) => {
            this.wrapper.style.backgroundImage =  `url("${url}")`;
        };

        try{
            if (this.currentTime > 0){
                var videoScreenshotImage = this.getScreenshot(this.video);
                setBackground(videoScreenshotImage.src);
    
            }else{
                setBackground(this.options.poster);
            }
        }catch{
            //poster is set by default as background, it will be shown on this scenario
        }
    }

    getScreenshot(videoEl, scale) {
        scale = scale || 1;
    
        var canvas = document.createElement("canvas");
        canvas.width = videoEl.clientWidth * scale;
        canvas.height = videoEl.clientHeight * scale;
        canvas.getContext('2d').drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    
        var image = new Image();
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = canvas.toDataURL('image/jpeg');
        return image;
    }
}
var vidOptions = {
    autoplay: false,
    poster: 'https://zcast.swncdn.com/episodes/zcast/the-alternative/2020/06-28/829406/801_20206264470004.jpg',
    sources: [
        {
            src: 'https://zcast.swncdn.com/episodes/zcast/gateway-church/2020/04-26/816286/1046_202042445030-c.mp4' // clip
        },
        { 
            src: 'https://zcast.swncdn.com/episodes/zcast/greg-laurie-tv/2020/01-05/801572/802_2020128121316.mp4',
            mp3Url: 'https://zcast.swncdn.com/episodes/zcast/greg-laurie-tv/2020/01-05/801572/802_2020128121316.mp3'
        }
    ],
    skipText: 'SKIP to Full Message',
    skipTextMobile: "SKIP"
};  
new Player("player", vidOptions);

