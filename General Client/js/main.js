var server_url = "http://127.0.0.1:8888/";
var socket_url = "ws://127.0.0.1:8888/socketapi";
var content_url = "http://127.0.0.1:8888/";
var last_latitude = 0;
var last_longitude = 0;


var settings;

function settings_load()
{
    
    if(localStorage.getItem('settings'))
        settings = JSON.parse(localStorage.getItem('settings'))
    else
        settings = {laststate : {roomid : 0, convid: 0, lat: 0, lng: 0}};
}

function settings_save()
{
    localStorage.setItem('settings', JSON.stringify(settings));
}



function server_call(p, a, s)
{
    if(a && a !== "")
        a = "?" + a;

    var q = server_url + p + ".json" + a;

    $.ajax({
        dataType: "jsonp",
        url: q,
        success: function (result) {
            s(result);
        },
        error: function(jqXHR, textStatus, errorThrown){}
        });
}

function get_location(onsccess)
{
    return navigator.geolocation.getCurrentPosition(function(position) {
                onsccess(position.coords.latitude,position.coords.longitude);
                last_latitude = position.coords.latitude;
                last_longitude = position.coords.longitude;

                settings.laststate.lat = position.coords.latitude;
                settings.laststate.lng = position.coords.longitude;
                settings_save();
            }, function onError() { /* ignore */ });
}

function get_preloader(sz, h)
{
    return "<div style='float: left; height: " + ((h / 2) - sz) + "px; width: 100%; margin-bottom: -24px;'></div><center><div class='preloader'><img src='img/preloader.gif' width='" + sz + "px'/></div></center>";
}

function get_content_message(text, h)
{
    return "<center><div style='float: left; height: " + (h / 2)+ "px; width: 100%; margin-bottom: -24px;'></div><div class='content-message'>" + text + "</div><center>";
}

function rooms_generate_room(obj)
{
    var s = "<div class='room_tile' onclick='conversation_display(\"" + obj.id + "\")'>" +
                        "<img src='img/test/r1.png'/>" +
                        "<div class='room_tile_text'><div class='room_tile_text_inner'>" +
                            "<h1>" + obj.name + "</h1>" +
                            "<p>Well, if you're around, get in here by 4.00pm, yep, it's just..</p>" +
                        "</div></div>" +
                    "</div>";
    return s;
}

function rooms_init_panel()
{
    get_location(function(lt, lg){

        var o = document.getElementById("rooms_ct");
        o.innerHTML = get_preloader(1);

        server_call("api/rooms/get", "lat=" + lt + "&long=" + lg, function(r){

            var o = document.getElementById("rooms_ct");
            var s = "";

            o.innerHTML = get_preloader(48, get_window_size().h);

            for(var i=0; i<r.length; i++)
            {
                s += rooms_generate_room(r[i]);
            }

            o.innerHTML = s;
            roomset_init();
        });

    });

}



/* conversations/notes/marking ------------------------------------------------------------*/



function note_focus(obj)
{
    obj.onkeypress = function(e)
    {
        var key = window.event ? e.keyCode : e.which;
        if(key == '13')
        {
            var conversation = new conversations()
            conversation.add_note(obj.getAttribute('data-cid'), obj.getAttribute('data-pid'), obj.value, function(o){
                o.value = "";
            }, obj);
        }
    }
}


function conversations()
{
    /* constructor */

    var parent = this;

    this.add_note = function(convid, id, text, onsuccess, param)
    {
        server_call("api/conversations/post", "convid=" + convid + "&postid=" + id + "&text=" + text, function(r){onsuccess(param);});
    }

    this.display = function(id, outobjid)
    {
        var outobj = document.getElementById(outobjid);


        if(!id || id === "null")
        {
            outobj.innerHTML = get_content_message("The conversation hasn't started yet, start it by posting something.", get_window_size().h);
            return 0;
        }
        

        outobj.innerHTML = get_preloader(48, get_window_size().h);

        server_call("api/rooms/get_conversation", "id=" + id, function(r){

            var s = "";


            settings.laststate.roomid = id;
            settings.laststate.convid = r.id;
            settings_save();

            if(!r.posts)
            {
                outobj.innerHTML = get_content_message("The conversation hasn't started yet, start it by posting something.", get_window_size().h);
                return 0;
            }

            if(!r.posts.length)
            {
                outobj.innerHTML = get_content_message("The conversation hasn't started yet, start it by posting something.", get_window_size().h);
                return 0;
            }

            r.posts.sort(function(x, y){
                return y.time.$date - x.time.$date;
            })

            for(var i=0; i<r.posts.length; i++)
            {
                s += parent.generate_post(r.posts[i], r.id);
            }

            outobj.innerHTML = s;
            synctime_set(outobj);

        });


    }

    this.generate_post = function(obj, convid)
    {
        var uname = "Anonymous";
        if(obj.user)
        {
            uname = obj.user.name;
        }

        var imgview = "";

        if(Math.random() > 0.5) imgview = "<div class='post-img'><img src='img/test/r3.png'/></div>";

        var sl = "<div class='post-full'> \
            <div class='post hasnotes'> \
                <div class='post-mdata'> \
                    <div class='post-dp-strip'> \
                        <div class='post-dp-dp'> \
                            <img src='img/test/dp1.png'/> \
                        </div> \
                        <div class='post-dp-up'> \
                        </div> \
                    </div> \
                    <div class='post-text'> \
                        <h1>" + uname + "</h1> \
                        <abbr class='synctime' data-mode='0' data-ts='" + obj.time.$date + "'></abbr><span class='post-loc' at Mayfield Park.</span><br/> \
                    </div> \
                        <div style='padding: 8px 15px 8px 15px'> \
                        <p>" + obj.text + "</p></div> " + imgview + " \
                        <div style='padding: 8px 15px 8px 15px'><div class='post-extra'> \
                            <a href='javascript: post_mark(\"" + convid + "\", \"" + obj.id + "\", \"0\", 1);'><img src='img/icons/love.svg' width='65px' /></a> + " + obj.rating + " others voted this. \
                        </div> \
                        <div style='clear: both;'></div> </div>\
                     \
                </div> \
            </div> \
            <div class='notes-ct'> \
                <div class'notes-inner'>";

        var sr = "<div class='notes-note'> \
                        <div class='notes-note-text' style='margin-left: 0;'> \
                            <textarea onfocus='note_focus(this)' data-pid='" + obj.id + "' data-cid='" + convid + "' placeHolder='Add note'></textarea> \
                        </div> \
                    </div></div> \
            </div> \
        </div>";


        var s = sl;
        var np = 0;
        var j = 0;

        if(obj.notes)
        {
            for (j in obj.notes.posts)
            {
                np = obj.notes.posts[j];
                if(np.user)
                    uname = np.user.name;

                if(j != 0) s += "<div class='notes-sep'></div>";

                s += "<div class='notes-note'> \
                        <div class='notes-note-dp'> \
                            <img src='img/test/dp1.png'/> \
                        </div> \
                        <div class='notes-note-text'> \
                            <h1>" + uname + "</h1> \
                            <p>" + np.text + "</p> \
                            <abbr class='synctime' data-mode='1' data-ts='" + np.time.$date + "'></abbr> \
                        </div> \
                    </div>";
            }
        }

        s += sr;


        return s;

    }

}




/* camera --------------------------------------------------------------------------------- */

var camera_tempimageid = 0;
var camera_imgfitting = false;
var camera_callback = 0;
var camera_backpanel = "page1";


function camera_add_photo()
{
    
    //navigator.camera.getPicture(function(imgdata){
        var imgdata = "img/test/camera1.jpg";

        if(camera_imgfitting) return 0;

        camera_tempimageid++;
        camera_imgfitting = true;

        //img.src = /* "data:image/jpeg;base64," + */ imgdata;

        camera_fit_image("canvasfximgcache_" + camera_tempimageid, imgdata, 700, function(imgdata){

            var cameraset = document.getElementById("cameraset");
            var img = document.createElement('img');
            img.id = "cameraimg_" + camera_tempimageid;
            img.src = imgdata;
            img.style.display = "none";
            cameraset.appendChild(img);

            var img2 = document.createElement('img');
            img2.id = "vcameraimg_" + camera_tempimageid;
            img2.src = imgdata;

            cameraset.innerHTML += "<div class='camera-panel'>" +
                                        "<div class='camera-panel-top' id='camera-panel-top-" + camera_tempimageid + "'>" +
                                            "<div class='camera-panel-write'><textarea placeholder=\"Write the story behind the photo\"></textarea></div>" +
                                            "<div class='camera-panel-close'><img src='img/icons/camera-close.svg' style='width: 40px; padding: 16px 8px 0 0;'/></div>" +
                                        "</div>" + 
                                        "<div id='vcimgcover_" + camera_tempimageid + "' onclick='camera_photo_toggle_controls(" + camera_tempimageid + ")'></div>" + 
                                        "<div class='camera-panel-bottom' id='camera-panel-bottom-" + camera_tempimageid + "'>" +
                                            "<div class='camera-panel-bfilter' onclick='camera_applyfx(" + camera_tempimageid + ", \"cinema\")'><img src='img/icons/camera-refresh.svg' style='width: 60px; padding: 4px 0 0 5px;'/></div>" +
                                            "<div class='camera-panel-bfilter' onclick='camera_applyfx(" + camera_tempimageid + ", \"cinema\")'><h1>c</h1><p>cinema</p></div>" +
                                            "<div class='camera-panel-bfilter' onclick='camera_applyfx(" + camera_tempimageid + ", \"retro\")'><h1>r</h1><p>retro</p></div>" +
                                            "<div class='camera-panel-bfilter' onclick='camera_applyfx(" + camera_tempimageid + ", \"bnw\")'><h1>b</h1><p>b&amp;w</p></div>" +
                                            "<div class='camera-panel-bfilter' onclick='camera_applyfx(" + camera_tempimageid + ", \"focus\")'><h1>f</h1><p>focus</p></div>" +
                                            "<div class='camera-panel-bfilter' onclick='camera_applyfx(" + camera_tempimageid + ", \"indie\")'><h1>i</h1><p>indie</p></div>" +
                                        "</div>" +
                                        "<div style='clear: both;'></div>" +
                                    "</div>";
            var vcimgcover = document.getElementById("vcimgcover_" + camera_tempimageid);
            if(vcimgcover)
            {
                vcimgcover.appendChild(img2);
            }

            camera_imgfitting = false;
        });


        

    //},
    //function(message) { },
    //{ quality: 50, destinationType:  Camera.DestinationType.DATA_URL} );
}

function camera_fit_image(id, url, maxsize, callback)
{
    var sourceImage = new Image();

    sourceImage.onload = function() {
        // Create a canvas with the desired dimensions
        var canvas = document.createElement("canvas");

        canvas.id = id;
        canvas.width  = sourceImage.width;
        canvas.height = sourceImage.height;

        var ws = 0, hs = 0;
        if (canvas.width != 0)
            ws = maxsize / canvas.width;
        if (canvas.height != 0)
            hs = maxsize/ canvas.height;                

        var iscale = Math.min(ws, hs);

        canvas.width = canvas.width * iscale;
        canvas.height = canvas.height * iscale;

        // Scale and draw the source image to the canvas
        canvas.getContext("2d").drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a data URL in PNG format
        callback(canvas.toDataURL('image/jpeg'));
    }

    sourceImage.src = url;
}


function camera_applyfx(idn, fx)
{
    var imgid = "cameraimg_" + idn;
    var canvas, ctx, img;
    var canvas_id = 'canvas_photofx';
    
    canvas = document.getElementById(canvas_id);
    img = document.getElementById(imgid);
    
    if(!canvas) return 0;
    if(!img) return 0;
    
    ctx = canvas.getContext('2d');
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, canvas.width, canvas.height);
    
    switch(fx)
    {
    case "cinema": image_fxpreset_cinemascope(canvas_id); break;
    case "retro": image_fxpreset_retro(canvas_id); break;
    case "bnw": image_fxpreset_bnw(canvas_id); break;
    case "focus": image_fxpreset_focus(canvas_id); break;
    case "indie": image_fxpreset_focus(canvas_id); break;
    }
    
    document.getElementById("v" + imgid).src = canvas.toDataURL('image/jpeg');
    
}

function camera_photo_toggle_controls(id)
{
    var o = document.getElementById("camera-panel-top-" + id);
    if(!o) return 0;
    var ob = document.getElementById("camera-panel-bottom-" + id);
    if(!ob) return 0;

    if(o.style.display === "none")
    {
        o.style.display = "";
        ob.style.display = "";
    }else{
        o.style.display = "none";
        ob.style.display = "none";
    }
}


function camera_publish()
{
    if(!camera_callback) return 0;

    dset = [];
    for(var i=0; i<camera_tempimageid; i++)
    {
        var o = document.getElementById("vcameraimg_" + (i + 1));
        if(o)
        {
            dset.push(o.src);
        }
    }
   
    camera_callback(dset);
    page_show(camera_backpanel);
}

function camera_set_callback(cbk)
{
    camera_callback = cbk;
}




/* friends and people ------------------------------------------- */



function people_search()
{
    var o = document.getElementById("friends-search-input");

    if(!o.value) /* display friends */
    {
        return 1;
    }

    server_call("api/people/search_simple", "q=" + o.value, function(r)
    {
        people_displaylist(r);

    });
}

function people_displaylist(r)
{
    var fl = document.getElementById('friends-list');
    var s = "<table style='width: 100%'>" +
                    "<tr><td><div class='friend-block-inner' onclick='show_dialog(\"friends-search\"," +
                    "\"friends-search-input\");'><div class='friend-block-fulloverlay'>" + 
                    "<img src='img/icons/search.svg' width='100px' /></div></div></td>";

    for(var i=0; i<r.length; i++)
    {
        if(i % 2 == 1 && i !== 0) s += "</tr><tr>";
        s += "<td><div class='friend-block-inner' onclick='people_show_profile(\"" + r[i].id + "\")'><div class='friend-block-overlay'><img src='img/test/info1.png'/>" + r[i].fname + " " + r[i].lname + "</div></div></td>";
    }

    s += "</tr></table>";
    fl.innerHTML = s;
}

function people_displayfriend_list()
{
    server_call("api/people/get_friends", "id=" + 0, function(r)
    {
        people_displaylist(r);
    });
}

function people_show_profile(userid)
{
    page_show('profile');
}




/* introduction ---------------------------------------------------- */

function introduction_display()
{
    if(!settings.laststate.roomid) return 0;

    server_call("api/rooms/get_info", "id=" + settings.laststate.roomid, function(r){

        document.getElementById('intro-text').onclick = function(){conversation_display(settings.laststate.roomid)};
        document.getElementById('intro-header').innerHTML = r.name;
        document.getElementById('intro-details').innerHTML = r.dsc + " | " + r.address;    
    });


}


/* creating posts and stuff ---------------------------------------- */



function post_publish()
{
    if(!settings.laststate.convid) return 0;

    var v = document.getElementById('newpost-text-post').value;
    if(v == "") return 0;

    server_call("api/conversations/post", "convid=" + settings.laststate.convid + "&postid=0&type=text&text=" + v, function(r){

        document.getElementById('newpost-text-post').value = "";

    });
}

function post_mark(convid, postid, noteid, isup)
{
    var s = "convid=" + convid + "&postid=" + postid + "&noteid=" + noteid;

    if(isup)
    {
        
        server_call("api/conversations/up", s, function(r){

            //document.getElementById('newpost-text-post').value = "";

        });

    }else{
        
        server_call("api/conversations/down", s, function(r){

            //document.getElementById('newpost-text-post').value = "";

        });
    }
}


function room_publish()
{
    /* get_location(function(lt, lg){

        var s = "name=" + document.getElementById('newroom-name').value +
        "&lat=" + lt +
        "&long=" + lg +
        "&size=" + 50 +
        "&dsc=" + document.getElementById('newroom-dsc').value +
        "&address=" + document.getElementById('newroom-address').value + 
        "&ticketurl=" + document.getElementById('newroom-ticketurl').value;

        server_call("api/rooms/create", s, function(r){

            document.getElementById('newroom-name').value = "";
            document.getElementById('newroom-dsc').value = "";
            document.getElementById('newroom-address').value = "";
            document.getElementById('newroom-ticketurl').value = "";

        });

    });*/

    if(newroom_imageset.length > 0)
    {
        photo_upload_roomdp(0, newroom_imageset[0]);
    }

}



/* map ----------------------------------------------------------------------------------------- */

var map = null;
                        
function map_initialize()
{
    map = new Microsoft.Maps.Map(document.getElementById('rmap'), {credentials: 'AlzEMHjU5aY8KPCt4FIgmwH3XuVLrs4QpfmZ0S7YDb7MlM1WjlAnTEeE01nGD3Nv',
        center: new Microsoft.Maps.Location(settings.laststate.lat, settings.laststate.lng), zoom: 16, mapTypeId: Microsoft.Maps.MapTypeId.road,
        showDashboard: false});

    map_show_rooms();
    Microsoft.Maps.Events.addHandler(map, 'mousemove', function (mouseEvent) {
        mouseEvent.handled = true; //A boolean indicating whether the event is handled. If this property is set to true, the default map control behavior for the event is cancelled.
    }); 
}


function map_show_rooms()
{
    server_call("api/rooms/get", "lat=" + settings.laststate.lat + "&long=" + settings.laststate.lng, function(r){

        
        var s = "";

        map.entities.clear(); 

        var pushpinOptions = {width: null, height: null, htmlContent: "<div style='border: 8px solid #e9d100; width: 14px; height: 14px; border-radius: 14px;'></div>"}; 
        var pushpin = new Microsoft.Maps.Pushpin(map.getCenter(), pushpinOptions);
        map.entities.push(pushpin);

        for(var i=0; i<r.length; i++)
        {
            var pushpinOptions = {width: null, height: null, htmlContent: "<div style='border: 5px solid #e90000; width: 10px; height: 10px; border-radius: 10px;'></div><div onclick='conversation_display(\"" + r[i].id + "\")' style='font-size:14pt; margin: 2px 0 0 17px; font-weight:300;border: 1px solid #8d8d8d; color: #4d545e; padding: 10px; font-family: \"Segoe WP\"; background-color:#f1f5ff;width:250px;'>" + r[i].name + "<div>" + r[i].dsc + "</div></div>"}; 
            var pushpin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(r[i].loc[0], r[i].loc[1]), pushpinOptions);
            map.entities.push(pushpin);
            
        }

        
    });
}

function map_mousemove(e)
{
    if(e.leftMouseButton == true)
    {
        return true;
    }
    return false;
}



/* subscriptions ---------------------------------------- */


function subscriptions_display()
{
    server_call("api/people/get_subscriptions", "", function(r){

        var o = document.getElementById('subscriptions-list');
        var s = "";

        for(var i=0; i<r.length; i++)
        {
            s += "<div class='schedule-item' onclick='conversation_display(\"" + r[i].id + "\")'>" +
                    "<div class='schedule-item-img'>" +
                        "<img src='img/test/schedule1.png'/>" +
                        "<div class='schedule-item-info'>" +
                            "<!--<h1>8.00PM</h1>-->" +
                            "<p>" + r[i].address + "</p>" +
                        "</div></div>" +
                    "<div class='schedule-item-text'>" +
                        "<h1>" + r[i].name + "</h1>" +
                        "<p>" + r[i].dsc + "</p>" +
                    "</div></div>";
        }

        o.innerHTML = s;

        
    });
}


/* easy camera capture --------------------------------------------------- */

var newpost_imageset = 0;
var newroom_imageset = 0;

function capture_image(onsuccess, returnpage)
{
    if(returnpage)
        camera_backpanel = returnpage;
    else
        camera_backpanel = "page1";

    camera_set_callback(onsuccess);
    page_show_dialog("camera1");
}


function newpost_photo_event(imgdata)
{
    if(!imgdata) return 0;
    if(imgdata.length < 1) return 0;

    if(imgdata.length > 1)
        document.getElementById('newpost-img-count').innerHTML = "+ " + (imgdata.length - 1) + " Photos";
    else
        document.getElementById('newpost-img-count').innerHTML = "";

    document.getElementById('newpost-img-display').src = imgdata[0];


    newpost_imageset = imgdata;
}

function newroom_photo_event(imgdata)
{
    if(!imgdata) return 0;
    if(imgdata.length < 1) return 0;

    document.getElementById('newroom-img-display').src = imgdata[0];
    newroom_imageset = imgdata;
}



/* room information ---------------------------------------------------------- */

var room_map = null;

function room_info_initialize()
{
    room_map = new Microsoft.Maps.Map(document.getElementById('rinfo_rmap'), {credentials: 'AlzEMHjU5aY8KPCt4FIgmwH3XuVLrs4QpfmZ0S7YDb7MlM1WjlAnTEeE01nGD3Nv',
        center: new Microsoft.Maps.Location(settings.laststate.lat, settings.laststate.lng), zoom: 16, mapTypeId: Microsoft.Maps.MapTypeId.road,
        showDashboard: false});

    room_map.entities.clear(); 

    var pushpinOptions = {width: null, height: null, htmlContent: "<div style='border: 8px solid #e9d100; width: 14px; height: 14px; border-radius: 14px;'></div>"}; 
    var pushpin = new Microsoft.Maps.Pushpin(room_map.getCenter(), pushpinOptions);
    room_map.entities.push(pushpin);

}



/* photo upload ------------------------------------------------------------ */

function photo_upload_roomdp(roomid, data)
{
    photo_upload_collection("api/photos/add_roomdp.json?roomid=" + roomid, data, 0);
}


function photo_upload_collection(url, data, progresscallback)
{

    var q = content_url + url;

    $.ajax({
        dataType: "jsonp",
        url: q,
        success: function (result) {
           alert(1);
        },
        error: function(jqXHR, textStatus, errorThrown){}
        });

    alert(content_url + url);
    /*
    var xhr = new XMLHttpRequest();
    var fd = new FormData();

    fd.append("upload", data);
    xhr.open("POST", content_url + url);
    alert(content_url + url);
    if(progresscallback)
    {
        xhr.upload.addEventListener("progress", function(e) {
            if (e.lengthComputable)
            {
                var percentage = Math.round((e.loaded * 100) / e.total);
                progresscallback(percentage);
            }}, false);
    }
        
    xhr.setRequestHeader("Content-Type", "multipart/form-data");
    xhr.setRequestHeader('UP-FILENAME', "photo.jpg");
    xhr.setRequestHeader('UP-SIZE', 100);
    xhr.setRequestHeader('UP-TYPE', "image/jpg");
    
    xhr.send(data);
    
    xhr.onreadystatechange = function(){if(xhr.readyState==4){alert(1)};}; */
}


function test()
{
        navigator.camera.getPicture(uploadPhoto,
                                    function(message) { alert('get picture failed'); },
                                    { quality: 50, 
                                    destinationType: navigator.camera.DestinationType.FILE_URI,
                                    sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY }
                                    );
}
function uploadPhoto(imageURI) {
    var options = new FileUploadOptions();
    options.fileKey="file";
    options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.mimeType="image/jpeg";

    var params = new Object();
    params.value1 = "test";
    params.value2 = "param";

    options.params = params;

    photo_upload_collection("api/photos/add_roomdp.json?roomid=" + 1, 0, 0);
    //var ft = new FileTransfer();
    //ft.upload(imageURI, content_url + "api/photos/add_roomdp.json?roomid=1", win, fail, options);
}

function win(r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
}

function fail(error) {
    alert("An error has occurred: Code = " = error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}
