class Video {
    constructor(elementId, options) {
        this.elId = elementId;
        this.element = document.getElementById(elementId);
        
        if (options.autoplay) this.element.setAttribute("autoplay","");
        this.setSource(options.sources);
    }
    setSource(sources) {
        if (sources.length === 1) {
            this.element.setAttribute("src", sources[0].src);
            return;
        }
        // more than 1 source
        console.log('setSource and elId is ' + this.elId);
    }
}
var vidOptions = {
    autoplay: false,
    sources: [
        { 
            src: 'https://zcast.swncdn.com/episodes/zcast/greg-laurie-tv/2020/01-05/801572/802_2020128121316.mp4'
        }
    ]
};  
new Video("vid", vidOptions);

