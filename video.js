// class Video2 extends HTMLElement {
//     constructor()
// }

class Video {
    debug(msg) {
        document.getElementById("debug").innerHTML = `${msg} ${Date.now()}`;
    }
    constructor(elementId, options) {
        var that = this;
        this.elementId = elementId;
        this.video = document.getElementById(elementId);
        this.wrapper = this.video.parentNode;
        this.wrapper.id = `${elementId}-wrapper`;

        if (options.poster) this.video.setAttribute("poster",options.poster);
        if (options.autoplay) this.video.setAttribute("autoplay","");

        // set basic css rules
        this.wrapper.style = "position:relative;";
        this.video.style = "position:absolute;top:0;left:0;width:100%;";
        
        this.setSource(options.sources);
        this.addControls();
        this.configVolume();
        this.configProgress();

        this.multipleVideos = options.sources.length > 1;
        if (this.multipleVideos) {
            this.skipText = options.skipText || "SKIP";
            this.configMultipleVideos(options.sources);
        }

        // loadedmetadata - set height of controls, which we don't know until video's meta data has loaded
        var controlWrapper = document.getElementById(`${this.elementId}-controls`);
        var durationCtrl = controlWrapper.querySelector(`[data-text='duration']`);
        this.video.addEventListener("loadedmetadata", function(e) {
            var videoHeight = e.currentTarget.offsetHeight;
            controlWrapper.style.height = videoHeight + "px";
            that.wrapper.style.height = videoHeight + "px"; // for good measure, also set height of wrapping div around this whole thing
            durationCtrl.innerHTML = that.timeToFriendly(e.currentTarget.duration);
        }, false);    
    }
    configProgress() {
        // timeupdate - update currentTime control
        var that = this;
        var currentTimeCtrl = this.wrapper.querySelector(`[data-text='currentTime']`);
        this.video.addEventListener("timeupdate", function(e) {
            currentTimeCtrl.innerHTML = that.timeToFriendly(e.currentTarget.currentTime);
        });         
    }    
    displayControls() {
        this.wrapper.classList.add("hover");
        if (this.timeoutId) clearTimeout(this.timeoutId); // clear any previous timeout
        this.timeoutId = setTimeout(() => {
            this.hideControls();
        }, 2500);
    }
    hideControls() {
        if (this.timeoutId) clearTimeout(this.timeoutId); // clear any previous timeout
        this.wrapper.classList.remove("hover");
    }
    setSource(sources) {
        this.video.setAttribute("src", sources[0].src);
    }
    // utils() {
    //     return {
    //         isMobile: () => {

    //         },
    //         isNotMobile: () => {
    //             return this.utils().isMobile();
    //         }
    //     };
    // }
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
    configMultipleVideos(sources) {
        var that = this;
        this.wrapper.insertAdjacentHTML('beforeend', `
            <div id="${this.elementId}-skip" style="cursor:default;color: white;font-size:13px;position:absolute;bottom:40px;right:20px;padding:10px 12px 9px 12px;background:#333;border-radius:3px;">
                <span style="display:inline-block;float:left;margin-right:8px;">${this.skipText}</span><img style="width:15px;margin-top:2px" src="http://content.swncdn.com/videoplayer/next_white.svg?v=1" />
            </div>
        `);
        document.getElementById(`${this.elementId}-skip`).addEventListener("click", (event) => {
            that.video.setAttribute("src", sources[1].src);
            event.currentTarget.style.display = 'none';
            that.video.play();
        });
    }
    addControls() {
        var that = this;
        this.wrapper.insertAdjacentHTML('beforeend', `
            <style>
                #${this.elementId}-controls { position:absolute;top:0;left:0;width:100%; transition: background .25s ease-in-out }
                #${this.elementId}-wrapper.hover #${this.elementId}-controls { background:rgba(0,0,0,.3); }
                #${this.elementId}-controls .op-0 { opacity:0; transition: opacity .25s ease-in-out; }
                #${this.elementId}-wrapper.hover #${this.elementId}-controls .op-0 { opacity:0.5; }
                #${this.elementId}-wrapper.hover #${this.elementId}-controls [data-action]:hover,
                    #${this.elementId}-wrapper.hover #${this.elementId}-controls .seekContainer:hover span { opacity:0.9; }   
                .mr-a { margin-right: auto; }
                .ml-a { margin-left: auto; }
                .mx-30 { margin-left: 30px; margin-right: 30px; }
                .mainControls { display:flex; top: 50%; position: absolute; left: 50%; margin-top: -30px; margin-left: -116px; }
                .mainControls img { flex:1; max-width:60px; max-height:60px; }
                .mainControls .seekContainer { position: relative; }
                .mainControls .seekContainer span { position: absolute; top: 22px; left: 18px; color: white; }
                .upperRight { position:absolute;top:20px;right:20px; }
                .upperRight img { display:inline-block;margin-left:20px; }
                .bottom { position: absolute;bottom:20px;left:0; color: white;}
            </style>
            <div id="${this.elementId}-controls">
                <div class="mainControls" style="display:flex;">
                    <div class='seekContainer'><span class="op-0">10</span><img data-action="rewind" class="ml-a op-0" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODUiIHZpZXdCb3g9IjAgMCA4MCA4NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+MTBzIGJhY2s8L3RpdGxlPjxwYXRoIGQ9Ik0xNS4xOTcgMTQuNDc4bDMuMjY4IDEuNzUzQzkuNDk1IDIyLjc5IDMuNjYyIDMzLjM4NyAzLjY2MiA0NS4zNTJjMCAxOS45MTMgMTYuMTQzIDM2LjA1NiAzNi4wNTYgMzYuMDU2IDE5LjkxNCAwIDM2LjA1Ny0xNi4xNDMgMzYuMDU3LTM2LjA1NiAwLTE4LjI0LTEzLjU0Ny0zMy4zMDgtMzEuMTI3LTM1LjcxM3Y0Ljg2OHMuMDA4Ljk2OC0uMzA1IDEuMTAzYy0uNDI1LjE4My0xLjA0LS4yMjQtMS4wNC0uMjI0TDMxLjQyOCA5LjA0OXMtLjgxOC0uMzg2LS44MTgtLjc0YzAtLjQyMi44MTYtLjc5Ny44MTYtLjc5N0w0My42Ljg5OHMuMzY4LS4yNjQuNzcyLS4wNDhjLjI5LjE1NC4yNzYuODIzLjI3Ni44MjNWNi4yNGMxOS40NTEgMi40MjcgMzQuNTA3IDE5LjAwNCAzNC41MDcgMzkuMTEzIDAgMjEuNzgtMTcuNjU2IDM5LjQzNy0zOS40MzcgMzkuNDM3LTIxLjc4IDAtMzkuNDM2LTE3LjY1Ny0zOS40MzYtMzkuNDM3IDAtMTIuNTEgNS44My0yMy42NSAxNC45MTUtMzAuODc0IiBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4="></div>
                    <img data-action="play" data-toggle-action="pause" class="mx-30 op-0" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgdmlld0JveD0iMCAwIDkwIDkwIj48cGF0aCBmaWxsPSIjRkZGIiBkPSJNODguMTY0IDQyLjc2MWMyLjQ0NyAxLjIzNyAyLjQ0NyAzLjI0MSAwIDQuNDc4TDQuNDM0IDg5LjUxNEMxLjk4NSA5MC43NSAwIDg5LjU0NyAwIDg2LjgzVjMuMTY5QzAgLjQ1IDEuOTg1LS43NTEgNC40MzQuNDg2bDgzLjczIDQyLjI3NXoiLz48L3N2Zz4=">
                    <img data-action="pause" data-toggle-action="play" style="display:none;width:90px;" class="mx-30 op-0" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3NSIgaGVpZ2h0PSI5NSIgdmlld0JveD0iMCAwIDc1IDk1Ij48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMCAwaDI1djk1SDB6TTUwIDBoMjV2OTVINTB6Ii8+PC9zdmc+">
                    <div class='seekContainer'><span class="op-0">10</span><img data-action="fastForward" class="mr-a op-0" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODUiIHZpZXdCb3g9IjAgMCA4MCA4NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+MTBzIGZvcndhcmQ8L3RpdGxlPjxwYXRoIGQ9Ik02NC4yNCAxNC40NzhsLTMuMjY5IDEuNzUzYzguOTcyIDYuNTU5IDE0LjgwNCAxNy4xNTYgMTQuODA0IDI5LjEyMSAwIDE5LjkxMy0xNi4xNDMgMzYuMDU2LTM2LjA1NyAzNi4wNTYtMTkuOTEzIDAtMzYuMDU2LTE2LjE0My0zNi4wNTYtMzYuMDU2IDAtMTguMjQgMTMuNTQ3LTMzLjMwOCAzMS4xMjctMzUuNzEzdjQuODY4cy0uMDA4Ljk2OC4zMDUgMS4xMDNjLjQyNS4xODMgMS4wNC0uMjI0IDEuMDQtLjIyNEw0OC4wMSA5LjA0OXMuODE4LS4zODYuODE4LS43NGMwLS40MjItLjgxNy0uNzk3LS44MTctLjc5N0wzNS44MzcuODk4cy0uMzY5LS4yNjQtLjc3Mi0uMDQ4Yy0uMjkuMTU0LS4yNzYuODIzLS4yNzYuODIzVjYuMjRDMTUuMzM3IDguNjY2LjI4MiAyNS4yNDMuMjgyIDQ1LjM1MmMwIDIxLjc4IDE3LjY1NiAzOS40MzcgMzkuNDM2IDM5LjQzN3MzOS40MzctMTcuNjU3IDM5LjQzNy0zOS40MzdjMC0xMi41MS01LjgzMS0yMy42NS0xNC45MTUtMzAuODc0IiBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4="></div>
                </div>
                <div class="upperRight">
                    <img data-action="mute" data-toggle-action="unMute" style="display:none;" class="op-0" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMjUiIHZpZXdCb3g9IjAgMCAzNCAyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+dm9sdW1lXzNiYXJzPC90aXRsZT48ZyBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik02Ljg0OCA2LjMwNkgxLjcyQy4yMTEgNi4zMDYgMCA2LjUxMSAwIDcuOTc3djkuMDQ1YzAgMS40NjYuMjExIDEuNjcyIDEuNzIgMS42NzJoNS4xM2w4LjcwMiA2LjAwNmMuNzk5LjU5MiAxLjQ0OC4yOCAxLjQ0OC0uNjk3Vi45OTdjMC0uOTc3LS42NS0xLjI5LTEuNDQ5LS42OTdMNi44NDggNi4zMDZ6TTMxLjYyNyAxMi40YzAgMy45NDEtMS43MTggNy40NzctNC40NDYgOS45NTNsMS4wOTUuODQ2QzMxLjE3OCAyMC40ODUgMzMgMTYuNjU3IDMzIDEyLjRzLTEuODIyLTguMDg1LTQuNzI1LTEwLjhsLTEuMDk1Ljg0OGMyLjcyOCAyLjQ3NSA0LjQ0NyA2LjAxMSA0LjQ0NyA5Ljk1MnpNMjMuMzg4IDEyLjRhOC4wMSA4LjAxIDAgMCAxLTIuMDg4IDUuMzlsMS4wOC44MzdhOS4zNTUgOS4zNTUgMCAwIDAgMi4zODEtNi4yMjggOS4zNSA5LjM1IDAgMCAwLTIuMzgxLTYuMjI4bC0xLjA4LjgzN2E4LjAyIDguMDIgMCAwIDEgMi4wODggNS4zOTF6Ii8+PHBhdGggZD0iTTI3LjUwOCAxMi40YzAgMy4wMDQtMS4yNDQgNS43MjMtMy4yNDkgNy42ODVsMS4wODMuODRjMi4xODYtMi4xOTYgMy41MzgtNS4yMDQgMy41MzgtOC41MjUgMC0zLjMyLTEuMzUyLTYuMzMtMy41MzgtOC41MjZsLTEuMDgzLjg0MmExMC43MTQgMTAuNzE0IDAgMCAxIDMuMjUgNy42ODR6Ii8+PC9nPjwvc3ZnPg==">
                    <img data-action="unMute" data-toggle-action="mute" style="display:none;" class="op-0" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMjUiIHZpZXdCb3g9IjAgMCAzNCAyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+dm9sdW1lX211dGU8L3RpdGxlPjxnIGZpbGw9IiNGRkYiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PHBhdGggZD0iTTYuODQ4IDYuMzA2SDEuNzJDLjIxMSA2LjMwNiAwIDYuNTExIDAgNy45Nzd2OS4wNDVjMCAxLjQ2Ni4yMTEgMS42NzIgMS43MiAxLjY3Mmg1LjEzbDguNzAyIDYuMDA2Yy43OTkuNTkyIDEuNDQ4LjI4IDEuNDQ4LS42OTdWLjk5N2MwLS45NzctLjY1LTEuMjktMS40NDktLjY5N0w2Ljg0OCA2LjMwNnoiLz48cGF0aCBkPSJNMzMuMDg0IDcuODhsLTEuNDIyLTEuNDIyLTQuNjE5IDQuNjItNC42Mi00LjYyTDIxIDcuODhsNC42MiA0LjYxOS00LjYyIDQuNjIgMS40MjIgMS40MjMgNC42MjEtNC42MiA0LjYyIDQuNjIgMS40MjEtMS40MjItNC42MTgtNC42MjEgNC42MTgtNC42MTl6IiBvcGFjaXR5PSIuNCIvPjwvZz48L3N2Zz4=">
                    <img data-action="fullScreen" class="op-0" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iMjUiIHZpZXdCb3g9IjAgMCAyNSAyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+ZnVsbHNjcmVlbjwvdGl0bGU+PGcgZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMjQuOTY5LjAwMlYwaC0zdi4wMDJsLTYtLjAwMnYzaDMuNzU0bC01Ljg3MSA1Ljg3MSAyLjEyMSAyLjEyMSA1Ljk5Ni01Ljk5NlY5aDNWLjAwMnpNOSAyMkg1LjI0Nmw1Ljg3MS01Ljg3MS0yLjEyMS0yLjEyMUwzIDIwLjAwNFYxNkgwdjloOXYtM3oiLz48L2c+PC9zdmc+">                
                </div>
                <div class="bottom">
                    <span data-text="currentTime" class="op-0">0:00</span>
                    <span data-text="duration" class="op-0"></span>
                </div>
            </div>
        `);

        var controlWrapper = document.getElementById(`${this.elementId}-controls`);
        var controls = controlWrapper.querySelectorAll("[data-action]");
        controls.forEach(ctrl => {
            ctrl.addEventListener("click", (event) => {
                var button = event.currentTarget;
                var action = button.getAttribute("data-action"); // play | rewind | fastForward | pause | volume | fullScreen
                
                switch(action) {
                    case "play":
                    case "pause":
                        this.swapControls(button);
                        if (this.video.paused) {
                            this.video.play();
                        } else {
                            this.video.pause();
                        }
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
                    default:
                        throw "Player control not supported: " + action;
                }
            });
        });

        this.wrapper.onmouseover = function(e) {
            that.displayControls();
            that.debug('onmouseover ' + e.currentTarget.id);
        };
        this.wrapper.onmouseout = function(e) {
            //that.hideControls();
            //that.debug('onmouseout ' + e.currentTarget.id);
        };        
        this.wrapper.addEventListener("touchstart", function(e) {
            that.displayControls();
            that.debug('touchstart ' + e.currentTarget.id);
        });  
    }
    swapControls(triggerEl) {
        var toggleAction = triggerEl.getAttribute("data-toggle-action"); // play | pause                                            
        var ctrlToToggle = document.getElementById(`${this.elementId}-controls`).querySelector(`[data-action='${toggleAction}']`);        
        ctrlToToggle.style.display = "inline-block";
        triggerEl.style.display = "none";        
    }
}
var vidOptions = {
    autoplay: false,
    poster: 'https://placehold.it/640x360&text=cover',
    sources: [
        {
            src: 'https://zcast.swncdn.com/episodes/zcast/gateway-church/2020/04-26/816286/1046_202042445030-c.mp4' // clip
        },
        { 
            src: 'https://zcast.swncdn.com/episodes/zcast/greg-laurie-tv/2020/01-05/801572/802_2020128121316.mp4'
        }
    ],
    skipText: 'SKIP to Full Message'
};  
var vid = new Video("vid", vidOptions);

