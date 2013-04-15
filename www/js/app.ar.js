 
var sampleData;
            
/* ==================== Controller ==================== */
            
var controller = {
    data : []                           
};
            
controller.init = function () {
    var host ='http://www.t3me.com/api/v1.1/app/';
    var url = host+'index.ar.php?callback=?';
    console.log( url );
                
    this.rootView =  {
        backLabel: null,
        view:  $("<div class='articles'></div>")
    };
                
    $.ajax({
        url: url,
        dataType: "json",
        success: function(data, textStatus, jqXHR) {
                         
            controller.rootData = data;
            controller.renderDefaultView();
        //console.log(data);
                         
        },
        error: function(jqXHR, textStatus, errorThrown) { 
            alert("error") 
        }
    });
                
    return;
};
            
controller.renderDefaultView = function () {
    this.rootView.view.children().remove();
                
    var html = "";
    for ( var i = 0; i < controller.rootData.item.length; i ++ )
    {
        var article = controller.rootData.item[i];
        console.log(article);
        if(article.type == "news" || article.type == "reviews"){
            html += "<div class='single-article news' id='item-" + i + "'onclick='controller.renderDetails(\"" + i + "\")'>"; 
            html += "<div class='article-img blue-border'><img height='135' width='200' src='"+article.images[0]+"' /></div>";
        }
        else if(article.type == "features" ){
            html += "<div class='single-article features' id='item-" + i + "'onclick='controller.renderDetails(\"" + i + "\")'>"; 
            html += "<div class='article-img orange-border'><img height='135' width='200' src='"+article.images[0]+"' /></div>";
        }
        html += "<div class='article-data'>";
        html += "<span class='author'>"+article.category+"</span>";
        html +=  "<h2>"+article.title+"</h2>";
        html += "<p>" + article.shortdesc + "</p>";
        html += "</div>";
        html += "</div>";
        html += "<div class='clearfix'></div>";
    }

    html += "</div>";
    this.rootView.view.html( html );
    setTimeout( function() {
        window.viewNavigator.refreshScroller();
    }, 10 );
                
                
}
            
controller.renderDetails = function (index) {
    var article = controller.rootData.item[index];
    var html = "<div id='detail'>";
    html += "<div class='article-data'>";
    html += "<span class='date'>"+article.pubDate+"</span> - ";
    html += "<span class='author'>"+article.category+"</span>";
    html +=  "<h1>"+article.title+"</h1>";       
    html += "<div class='articleDesc'>";
    if(article.type == 'news' || article.type == 'reviews' || article.type == 'features'){
        html += "<img src='"+article.images[0]+"'/>";
        for( var i = 0 ; i < article.text.length ; i++)
            html += "<p>"+article.text[i]+"</p>"
    }
                
    html += "</div>";
    html += "</div>";
            	
    var articleId = "item-"+index;
    var callback = function() {
        controller.rootView.view.find( "#"+articleId ).removeClass( "listSelected" );
    }
            	
    var viewDescriptor =  {
        title: article.title, 
        backLabel: "الرجوع",
        backCallback: callback,
        view:  $(html)
    };
					     
    window.viewNavigator.pushView( viewDescriptor);
}
             

$(document).ready( function() {
                
    //Youtube API
    (function() {
        function createPlayer(jqe, video, options) {
            var ifr = $('iframe', jqe);
            if (ifr.length === 0) {
                ifr = $('<iframe scrolling="no">');
                ifr.addClass('player');
            }
            var src = 'http://www.youtube.com/embed/' + video.id;
            if (options.playopts) {
                src += '?';
                for (var k in options.playopts) {
                    src+= k + '=' + options.playopts[k] + '&';
                }  
                src += '_a=b';
            }
            ifr.attr('src', src);
            jqe.append(ifr);  
        }
    
        function createCarousel(jqe, videos, options) {
            var car = $('div.carousel', jqe);
            var wrapper = $('<div class="carousel-wrapper">');
            if (car.length === 0) {
                
                car = $('<ul>');
                car.addClass('carousel');
                wrapper.append(car);
                jqe.append(wrapper);
            
            }
            $.each(videos, function(i,video) {
                options.thumbnail(car, video, options); 
            });
        }
    
        function createThumbnail(jqe, video, options) {
            var imgurl = video.thumbnails[0].url;
            var img = $('img[src="' + imgurl + '"]');

            if (img.length !== 0) return;
            img = $('<img>');    
            var li = $('<li><p class="video_title">'+video.title+'</p></li>');
            img.addClass('thumbnail');
            li.append(img);
            jqe.append(li);
            img.attr('src', imgurl);
            img.attr('title', video.title);
            
            img.click(function() {
                options.player(options.maindiv, video, $.extend(true,{},options,{
                    playopts:{
                        autoplay:1
                    }
                }));
            });
        }
    
        var defoptions = {
            autoplay: false,
            user: null,
            carousel: createCarousel,
            player: createPlayer,
            thumbnail: createThumbnail,
            loaded: function() {},
            playopts: {
                autoplay: 0,
                egm: 1,
                autohide: 1,
                fs: 1,
                showinfo: 0
            }
        };
    
    
        $.fn.extend({
            youTubeChannel: function(options) {
                var md = $(this);
                md.addClass('youtube');
                md.addClass('youtube-channel');
                var allopts = $.extend(true, {}, defoptions, options);
                allopts.maindiv = md;
                $.getJSON('http://gdata.youtube.com/feeds/users/' + allopts.user + '/uploads?alt=json-in-script&format=5&max-results=15&callback=?', null, function(data) {
                    var feed = data.feed;
                    var videos = [];
                    $.each(feed.entry, function(i, entry) {
                        var video = {
                            title: entry.title.$t,
                            id: entry.id.$t.match('[^/]*$'),
                            thumbnails: entry.media$group.media$thumbnail
                        };
                        videos.push(video);
                    });
                    allopts.allvideos = videos;
                    allopts.carousel(md, videos, allopts);
                    allopts.player(md, videos[0], allopts);
                    allopts.loaded(videos, allopts);
                });
            } 
        });
    
    })();
        
    $(function() {
        $('#player').youTubeChannel({
            user:'t3medotcom'
        });
    });
            
           
			
    //initialize the application controller
    controller.init();
    //Setup the ViewNavigator
    window.viewNavigator = new ViewNavigator( 'body' );	
    window.viewNavigator.pushView( controller.rootView );
    $("#latest a").click(function(){
        $('.news').show();
        $('.features').show();
        window.viewNavigator.refreshScroller();
    });			
    $("#news a").click(function(){
        $('.news').show();
        $('.features').hide();
        window.viewNavigator.refreshScroller();
    });
    $("#feature a").click(function(){
        $('.news').hide();
        $('.features').show();
        window.viewNavigator.refreshScroller();
    });
				
});