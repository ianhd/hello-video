// class Video2 extends HTMLElement {
//     constructor()
// }

class Video {
    constructor(elementId, options) {
        this.elementId = elementId;
        this.element = document.getElementById(elementId);
        this.wrapper = this.element.parentNode;
        
        // set basic css rules
        this.wrapper.style = "position:relative;";
        this.element.style = "position:absolute;top:0;left:0;width:100%;";

        // // add progress bar
        // this.element.insertAdjacentHTML('afterend',`
        //     <progress id='${elementId}-progress' min='0' max='100' value='0'>0% played</progress>
        // `);
        // this.progress = document.getElementById(`${elementId}-progress`);
        // this.element.addEventListener('timeupdate', () => {
        //     this.onTimeUpdate(this.element,this.progress);
        // }, false);

        this.multipleVideos = options.sources.length > 1;
        
        if (options.autoplay) this.element.setAttribute("autoplay","");
        this.setSource(options.sources);
        this.addControls();
    }
    setSource(sources) {
        this.element.setAttribute("src", sources[0].src);
    }
    addControls() {
        this.wrapper.insertAdjacentHTML('beforeend', `
            <style>
                #${this.elementId}-controls { position:absolute;top:0;left:0;width:100%; transition: background .25s ease-in-out }
                #${this.elementId}-controls:hover { background:rgba(0,0,0,.4); }
                #${this.elementId}-controls [data-action] { opacity:0; transition: opacity .25s ease-in-out; }
                #${this.elementId}-controls:hover [data-action] { opacity:0.5; }
                #${this.elementId}-controls [data-action]:hover { opacity:0.9; }   
                .mr-a { margin-right: auto; }
                .ml-a { margin-left: auto; }
                .mx-30 { margin-left: 30px; margin-right: 30px; }
                .mainControls { display:flex; top: 50%; position: absolute; left: 50%; margin-top: -30px; margin-left: -116px; }
                .mainControls img { flex:1; max-width:60px; max-height:60px; }
            </style>
            <div id="${this.elementId}-controls">
                <div class="mainControls" style="display:flex;">
                    <img data-action="rewind" class="ml-a" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODUiIHZpZXdCb3g9IjAgMCA4MCA4NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+MTBzIGJhY2s8L3RpdGxlPjxwYXRoIGQ9Ik0xNS4xOTcgMTQuNDc4bDMuMjY4IDEuNzUzQzkuNDk1IDIyLjc5IDMuNjYyIDMzLjM4NyAzLjY2MiA0NS4zNTJjMCAxOS45MTMgMTYuMTQzIDM2LjA1NiAzNi4wNTYgMzYuMDU2IDE5LjkxNCAwIDM2LjA1Ny0xNi4xNDMgMzYuMDU3LTM2LjA1NiAwLTE4LjI0LTEzLjU0Ny0zMy4zMDgtMzEuMTI3LTM1LjcxM3Y0Ljg2OHMuMDA4Ljk2OC0uMzA1IDEuMTAzYy0uNDI1LjE4My0xLjA0LS4yMjQtMS4wNC0uMjI0TDMxLjQyOCA5LjA0OXMtLjgxOC0uMzg2LS44MTgtLjc0YzAtLjQyMi44MTYtLjc5Ny44MTYtLjc5N0w0My42Ljg5OHMuMzY4LS4yNjQuNzcyLS4wNDhjLjI5LjE1NC4yNzYuODIzLjI3Ni44MjNWNi4yNGMxOS40NTEgMi40MjcgMzQuNTA3IDE5LjAwNCAzNC41MDcgMzkuMTEzIDAgMjEuNzgtMTcuNjU2IDM5LjQzNy0zOS40MzcgMzkuNDM3LTIxLjc4IDAtMzkuNDM2LTE3LjY1Ny0zOS40MzYtMzkuNDM3IDAtMTIuNTEgNS44My0yMy42NSAxNC45MTUtMzAuODc0IiBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=">
                    <img data-action="play" data-toggle-action="pause" class="mx-30" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI5MCIgaGVpZ2h0PSI5MCIgdmlld0JveD0iMCAwIDkwIDkwIj48cGF0aCBmaWxsPSIjRkZGIiBkPSJNODguMTY0IDQyLjc2MWMyLjQ0NyAxLjIzNyAyLjQ0NyAzLjI0MSAwIDQuNDc4TDQuNDM0IDg5LjUxNEMxLjk4NSA5MC43NSAwIDg5LjU0NyAwIDg2LjgzVjMuMTY5QzAgLjQ1IDEuOTg1LS43NTEgNC40MzQuNDg2bDgzLjczIDQyLjI3NXoiLz48L3N2Zz4=">
                    <img data-action="pause" data-toggle-action="play" style="display:none;" class="mx-30" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI3NSIgaGVpZ2h0PSI5NSIgdmlld0JveD0iMCAwIDc1IDk1Ij48cGF0aCBmaWxsPSIjRkZGIiBkPSJNMCAwaDI1djk1SDB6TTUwIDBoMjV2OTVINTB6Ii8+PC9zdmc+">
                    <img data-action="fastForward" class="mr-a" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODUiIHZpZXdCb3g9IjAgMCA4MCA4NSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+MTBzIGZvcndhcmQ8L3RpdGxlPjxwYXRoIGQ9Ik02NC4yNCAxNC40NzhsLTMuMjY5IDEuNzUzYzguOTcyIDYuNTU5IDE0LjgwNCAxNy4xNTYgMTQuODA0IDI5LjEyMSAwIDE5LjkxMy0xNi4xNDMgMzYuMDU2LTM2LjA1NyAzNi4wNTYtMTkuOTEzIDAtMzYuMDU2LTE2LjE0My0zNi4wNTYtMzYuMDU2IDAtMTguMjQgMTMuNTQ3LTMzLjMwOCAzMS4xMjctMzUuNzEzdjQuODY4cy0uMDA4Ljk2OC4zMDUgMS4xMDNjLjQyNS4xODMgMS4wNC0uMjI0IDEuMDQtLjIyNEw0OC4wMSA5LjA0OXMuODE4LS4zODYuODE4LS43NGMwLS40MjItLjgxNy0uNzk3LS44MTctLjc5N0wzNS44MzcuODk4cy0uMzY5LS4yNjQtLjc3Mi0uMDQ4Yy0uMjkuMTU0LS4yNzYuODIzLS4yNzYuODIzVjYuMjRDMTUuMzM3IDguNjY2LjI4MiAyNS4yNDMuMjgyIDQ1LjM1MmMwIDIxLjc4IDE3LjY1NiAzOS40MzcgMzkuNDM2IDM5LjQzN3MzOS40MzctMTcuNjU3IDM5LjQzNy0zOS40MzdjMC0xMi41MS01LjgzMS0yMy42NS0xNC45MTUtMzAuODc0IiBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48L3N2Zz4=">
                </div>
                <img data-action="volume" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMjUiIHZpZXdCb3g9IjAgMCAzNCAyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+dm9sdW1lXzNiYXJzPC90aXRsZT48ZyBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik02Ljg0OCA2LjMwNkgxLjcyQy4yMTEgNi4zMDYgMCA2LjUxMSAwIDcuOTc3djkuMDQ1YzAgMS40NjYuMjExIDEuNjcyIDEuNzIgMS42NzJoNS4xM2w4LjcwMiA2LjAwNmMuNzk5LjU5MiAxLjQ0OC4yOCAxLjQ0OC0uNjk3Vi45OTdjMC0uOTc3LS42NS0xLjI5LTEuNDQ5LS42OTdMNi44NDggNi4zMDZ6TTMxLjYyNyAxMi40YzAgMy45NDEtMS43MTggNy40NzctNC40NDYgOS45NTNsMS4wOTUuODQ2QzMxLjE3OCAyMC40ODUgMzMgMTYuNjU3IDMzIDEyLjRzLTEuODIyLTguMDg1LTQuNzI1LTEwLjhsLTEuMDk1Ljg0OGMyLjcyOCAyLjQ3NSA0LjQ0NyA2LjAxMSA0LjQ0NyA5Ljk1MnpNMjMuMzg4IDEyLjRhOC4wMSA4LjAxIDAgMCAxLTIuMDg4IDUuMzlsMS4wOC44MzdhOS4zNTUgOS4zNTUgMCAwIDAgMi4zODEtNi4yMjggOS4zNSA5LjM1IDAgMCAwLTIuMzgxLTYuMjI4bC0xLjA4LjgzN2E4LjAyIDguMDIgMCAwIDEgMi4wODggNS4zOTF6Ii8+PHBhdGggZD0iTTI3LjUwOCAxMi40YzAgMy4wMDQtMS4yNDQgNS43MjMtMy4yNDkgNy42ODVsMS4wODMuODRjMi4xODYtMi4xOTYgMy41MzgtNS4yMDQgMy41MzgtOC41MjUgMC0zLjMyLTEuMzUyLTYuMzMtMy41MzgtOC41MjZsLTEuMDgzLjg0MmExMC43MTQgMTAuNzE0IDAgMCAxIDMuMjUgNy42ODR6Ii8+PC9nPjwvc3ZnPg==">
                <img data-action="fullScreen" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iMjUiIHZpZXdCb3g9IjAgMCAyNSAyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+ZnVsbHNjcmVlbjwvdGl0bGU+PGcgZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMjQuOTY5LjAwMlYwaC0zdi4wMDJsLTYtLjAwMnYzaDMuNzU0bC01Ljg3MSA1Ljg3MSAyLjEyMSAyLjEyMSA1Ljk5Ni01Ljk5NlY5aDNWLjAwMnpNOSAyMkg1LjI0Nmw1Ljg3MS01Ljg3MS0yLjEyMS0yLjEyMUwzIDIwLjAwNFYxNkgwdjloOXYtM3oiLz48L2c+PC9zdmc+">
            </div>
        `);

        var controlWrapper = document.getElementById(`${this.elementId}-controls`);

        // set height of controls, which we don't know until video's meta data has loaded
        var that = this;
        this.element.addEventListener("loadedmetadata", function(e) {
            var videoHeight = that.element.offsetHeight;
            controlWrapper.style.height = videoHeight + "px";
        }, false);         

        var controls = controlWrapper.querySelectorAll("[data-action]");
        controls.forEach(ctrl => {
            ctrl.addEventListener("click", (event) => {
                var button = event.currentTarget;
                var action = button.getAttribute("data-action"); // play | rewind | fastForward | pause | volume | fullScreen
                
                switch(action) {
                    case "play":
                    case "pause":
                        var toggleAction = button.getAttribute("data-toggle-action"); // play | pause                                            
                        var ctrlToToggle = document.getElementById(`${this.elementId}-controls`).querySelector(`[data-action='${toggleAction}']`);
                        if (this.element.paused) {
                            this.element.play();
                        } else {
                            this.element.pause();
                        }
                        ctrlToToggle.style.display = "inline-block";
                        button.style.display = "none";
                        break;
                    case "rewind":
                    case "fastForward":
                        var adjustBy = action == "rewind" ? -15 : 15;
                        var newTime = this.element.currentTime + adjustBy;
                        if (newTime < 0) newTime = 0;
                        else if (newTime > this.element.duration) newTime = audio.duration; // POTENTIAL ERROR - do we have to wait until "loadedmetadata" to get duration?
                        this.element.currentTime = newTime;
                        break;
                    default:
                        throw "Player control not supported: " + action;
                }
            });
        });
    }

    onTimeUpdate(element, progress) {
        var percentage = Math.floor((100 / element.duration) * element.currentTime);
        progress.value = percentage;
        progress.innerHTML = percentage + '% played';
    }
}
var vidOptions = {
    autoplay: false,
    sources: [
        {
            src: 'https://zcast.swncdn.com/episodes/zcast/gateway-church/2020/04-26/816286/1046_202042445030-c.mp4' // clip
        },
        { 
            src: 'https://zcast.swncdn.com/episodes/zcast/greg-laurie-tv/2020/01-05/801572/802_2020128121316.mp4'
        }
    ]
};  
var vid = new Video("vid", vidOptions);

