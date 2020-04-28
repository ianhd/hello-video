class Video {
    constructor(elementId, options) {
        this.elId = elementId;
        this.element = document.getElementById(elementId);
        this.multipleVideos = options.sources.length > 1;
        
        if (options.autoplay) this.element.setAttribute("autoplay","");
        this.setSource(options.sources);
    }
    setSource(sources) {
        this.element.setAttribute("src", sources[0].src);
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
new Video("vid", vidOptions);

