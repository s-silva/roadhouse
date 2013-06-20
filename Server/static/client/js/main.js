var server_url = "http://127.0.0.1:8888/";
var socket_url = "ws://127.0.0.1:8888/socketapi";
//var content_url = "http://127.0.0.1:8888/";
var content_url = "../../";
var last_latitude = 0;
var last_longitude = 0;
var swiped = 0;

var current_post_skip = 0;
var current_room_skip = 0;
var settings;
var cache_lastroom = 0;
var secure_key = "0";


function settings_load()
{
    
    if(localStorage.getItem('settings'))
    {
        settings = JSON.parse(localStorage.getItem('settings'))
        secure_key = settings.key;
    }else{
        settings = {key: "0", laststate : {roomid : 0, convid: 0, lat: 0, lng: 0}, lastuser: {uname: "", uid: "", dp_s: "", dp_l: ""}};
    }
}

function settings_save()
{
    localStorage.setItem('settings', JSON.stringify(settings));
}



function server_call(p, a, s)
{
    if(!secure_key) secure_key = "0";

    if(a && a !== "")
        a = "?" + "key=" + secure_key + "&" + a;
    else
        a = "?" + "key=" + secure_key

    var q = server_url + p + ".json" + a;

    $.ajax({
        dataType: "jsonp",
        url: q,
        success: function (result) {
            if(result.criticalerror)
            {
                //if(result.criticalerror === 102)
            }else{
                s(result);
            }
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
    return "<div style='float: left; height: " + ((h / 2) - sz) + "px; width: 100%; margin-bottom: -24px;'></div><center><div class='preloader'><img src='" + get_staticurl('img/preloader.gif') + "' width='" + sz + "px'/></div></center>";
}

function get_content_message(text, h)
{
    return "<center><div style='float: left; height: " + (h / 2)+ "px; width: 100%; margin-bottom: -24px;'></div><div class='content-message'>" + text + "</div><center>";
}

function rooms_generate_room(obj)
{
    var url = "";
    var sty = "";
    var ccolors = ["007680", "8d0082", "ffab00", "f62d0d", "66ad00"];

    if(obj.dp) url = obj.dp;
    else sty = "background-color: #" + ccolors[Math.ceil(Math.random() * ccolors.length)] + ";";
    var s = "<div class='room_tile' style='" + sty + "' onmousedown='swiped=0;' onmouseup='if(!swiped)conversation_display(\"" + obj.id + "\")'>" +
                        "<img onload='image_center_block(this)' src='" + url + "'/>" +
                        "<div class='room_tile_text'><div class='room_tile_text_inner'>" +
                            "<h1>" + obj.name + "</h1>" +
                            "<p>" + obj.dsc + "</p>" +
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

            if(r.length <= 0)
            {
                o.innerHTML = "<div onclick='page_show_dialog(\"newroom\");' style='margin-top:" + (get_window_size().h / 2 - 20) + "px; text-align: center; font-size: 20pt; color: #686868;'>There are no rooms around this area, make a new one!</div>";
            }else{

                for(var i=r.length-1; i>=0; i--)
                {
                    s += rooms_generate_room(r[i]);
                }

                o.innerHTML = s;
                roomset_init();
            }
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
               
                var noteset = document.getElementById("noteset_" + obj.getAttribute('data-pid'));

                if(noteset)
                {
                    var dp = "";
                    var uname = "You";

                    if(settings.lastuser)
                    {
                        uname = settings.lastuser.uname;
                        dp = settings.lastuser.dp_s;
                    }

                    var s = "";
                    s += "<div class='notes-sep' style='clear: both;'></div>";

                    s += "<div class='notes-note'> \
                            <div class='notes-note-dp'> \
                                <img src='" + dp + "'/> \
                            </div> \
                            <div class='notes-note-text'> \
                                <h1>" + uname + "</h1> \
                                <p>" + obj.value + "</p> \
                                <abbr class='synctime' data-mode='1' data-ts='" + new Date().getTime(); + "'></abbr> \
                            </div> \
                        </div>";

                    noteset.innerHTML += s;
                    synctime_set(noteset);
                }

                 o.value = "";
            }, obj);
        }
    }
}

function conversation_expand_current()
{
    var conversation = new conversations();
    conversation.expand_current("conversation_ct");
}


function conversations()
{
    /* constructor */

    var parent = this;

    this.add_note = function(convid, id, text, onsuccess, param)
    {
        server_call("api/conversations/post", "convid=" + convid + "&postid=" + id + "&text=" + text, function(r){onsuccess(param);});
    }

    this.expand_current = function(outobjid)
    {
        return this.display(settings.laststate.roomid, outobjid, 1);
    }

    this.display = function(id, outobjid, expand)
    {
        var outobj = document.getElementById(outobjid);

        if(expand && current_post_skip == 0) return 0;

        if(!id || id === "null")
        {
            outobj.innerHTML = get_content_message("The conversation hasn't started yet, start it by posting something.", get_window_size().h);
            return 0;
        }

        if(!expand)
        {
            outobj.innerHTML = get_preloader(48, get_window_size().h);
            current_post_skip = 0;
        }else{
            if(current_post_skip < 0)
                return 0;
        }

        server_call("api/rooms/get_conversation", "id=" + id + "&skip=" + current_post_skip, function(r){

            var s = "";


            settings.laststate.roomid = id;
            settings.laststate.convid = r.id;
            settings_save();

            if(!r.posts)
            {
                if(expand)
                {
                    current_post_skip = -1;
                    return 0;
                }

                outobj.innerHTML = get_content_message("The conversation hasn't started yet, start it by posting something.", get_window_size().h);
                return 0;
            }

            if(!r.posts.length)
            {
                if(expand)
                {
                    current_post_skip = -1;
                    return 0;
                }

                outobj.innerHTML = get_content_message("The conversation hasn't started yet, start it by posting something.", get_window_size().h);
                return 0;
            }

            current_post_skip += r.posts.length;

            r.posts.sort(function(x, y){
                return y.time.$date - x.time.$date;
            })

            for(var i=0; i<r.posts.length; i++)
            {
                s += parent.generate_post(r.posts[i], r.id);
            }

            if(expand)
                outobj.innerHTML += s;
            else
                outobj.innerHTML = s;
            synctime_set(outobj);

        });


    }

    this.generate_post = function(obj, convid)
    {
        var uname = "Anonymous";
        var nick = "anon";
        var nnotes = 0;
        var user_dp_s = "";

        if(obj.user)
        {
            uname = obj.user.name;
            nick = obj.user.username;
            user_dp_s = obj.user.dp_s;
        }

        if(obj.notecount)
            nnotes = obj.notecount;

        var imgview = "";

        if(obj.dp)
            if(obj.dp.length > 2)
                imgview = "<div class='post-img'><img onload='image_center_block(this);' src='" + obj.dp + "'/></div>";

        var sl = "<div class='post-full'> \
            <div class='post hasnotes'> \
                <div class='post-mdata'> \
                    <div class='post-dp-strip'> \
                        <div class='post-dp-dp'> \
                            <img src='" + user_dp_s + "'/> \
                        </div> \
                        <div class='post-dp-up'> \
                        </div> \
                    </div> \
                    <div class='post-text'> \
                        <h1>" + uname + " <span style='color: #b3b3b3; font-weight: 300; font-size: 14pt'>(@" + nick + ")</span></h1>\
                        <abbr class='synctime' data-mode='0' data-ts='" + obj.time.$date + "'></abbr><span class='post-loc' at Mayfield Park.</span><br/> \
                    </div> \
                        <div style='padding: 17px 15px 12px 15px'> \
                        <p>" + obj.text + "</p></div> " + imgview + " \
                        <div style='padding: 8px 15px 8px 15px'><div class='post-extra'> \
                            <div class='post-extra-icon love' onclick='post_mark(\"" + convid + "\", \"" + obj.id + "\", \"0\", 1);'><img src='" + get_staticurl("img/icons/love.png") + "' width='65px' /></div>\
                            <div class='post-extra-icon'><div class='post-extra-icon-big' id='postvotecount_" + obj.id + "'>" + obj.rating + "</div><div class='post-extra-icon-dsc'>votes</div></div> \
                            <div class='post-extra-icon'><div class='post-extra-icon-big' onclick='fetch_all_notes(\"" + obj.id + "\",\"" + convid + "\")'>" + nnotes + "</div><div class='post-extra-icon-dsc'>notes</div></div> \
                            <div style='clear: both;'></div>\
                        </div> \
                        <div style='clear: both;'></div> </div>\
                     \
                </div> \
            </div> \
            <div class='notes-ct'> \
                <div class'notes-inner'><div id='noteset_" + obj.id + "'>";

        var sr = "</div><div class='notes-note'> \
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
            var noteslen = obj.notes.posts.length;
            for (j in obj.notes.posts)
            {
                user_dp_s = "";
                uname = "Anonymous";

                np = obj.notes.posts[noteslen - j - 1];
                if(np.user)
                {
                    uname = np.user.name;
                    user_dp_s = np.user.dp_s;
                }

                if(j != 0) s += "<div class='notes-sep'></div>";

                s += "<div class='notes-note'> \
                        <div class='notes-note-dp'> \
                            <img src='" + user_dp_s + "'/> \
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

function fetch_all_notes(id, convid)
{
    var o = document.getElementById("noteset_" + id);
    if(!o) return 0;

    o.innerHTML = get_preloader(48, 200);

    server_call("api/conversations/get_all_notes", "id=" + id + "&convid=" + convid, function(r){
        var s = "";
        var j = 0;
        var noteslen = r.length;
        var uname = "Anonymous";
        var user_dp_s = "";
        
        for(j in r)
        {
            uname = "Anonymous";

            np = r[j];
            if(np.user)
            {
                uname = np.user.name;
                user_dp_s = np.user.dp_s;
            }

            if(j != 0) s += "<div class='notes-sep' style='clear: both;'></div>";

            s += "<div class='notes-note'> \
                    <div class='notes-note-dp'> \
                        <img src='" + user_dp_s + "'/> \
                    </div> \
                    <div class='notes-note-text'> \
                        <h1>" + uname + "</h1> \
                        <p>" + np.text + "</p> \
                        <abbr class='synctime' data-mode='1' data-ts='" + np.time.$date + "'></abbr> \
                    </div> \
                </div>";
        }

        o.innerHTML = s;
    });
}




/* camera --------------------------------------------------------------------------------- */

var camera_tempimageid = 0;
var camera_imgfitting = false;
var camera_callback = 0;
var camera_backpanel = "page1";


function camera_add_photo()
{
    
    navigator.camera.getPicture(function(imgdata){
        //var imgdata = get_staticurl("img/test/camera1.jpg");
        //imgdata = /* "data:image/jpeg;base64," + */ imgdata;

        if(camera_imgfitting) return 0;

        camera_tempimageid++;
        camera_imgfitting = true;

        
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
                                            "<div class='camera-panel-close'><img src='" + get_staticurl("img/icons/camera-close.png") + "' style='width: 40px; padding: 16px 8px 0 0;'/></div>" +
                                        "</div>" + 
                                        "<div id='vcimgcover_" + camera_tempimageid + "' onmousedown='swiped=0;' onmouseup='if(!swiped)camera_photo_toggle_controls(" + camera_tempimageid + ")'></div>" + 
                                        "<div class='camera-panel-bottom' id='camera-panel-bottom-" + camera_tempimageid + "'>" +
                                            "<div class='camera-panel-bfilter' onclick='camera_applyfx(" + camera_tempimageid + ", \"restore\")'><img src='" + get_staticurl("img/icons/camera-refresh.png") + "' style='width: 50px; height: auto; padding: 4px 5px 0 5px;'/></div>" +
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


        

    },
    function(message) { },
    { quality: 50, destinationType:  Camera.DestinationType.DATA_URL} );
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
    case "indie": image_fxpreset_indie(canvas_id); break;
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
                    "<img src='" + get_staticurl("img/icons/search.png") + "' width='100px' /></div></div></td>";

    for(var i=0; i<r.length; i++)
    {
        if(!r[i]) continue;
        if(r[i].id === settings.lastuser.uid) continue;
        if(i % 2 == 1 && i !== 0) s += "</tr><tr>";
        s += "<td><div class='friend-block-inner' onclick='people_show_profile(\"" + r[i].id + "\", \"" + r[i].id  + "\")'><div class='friend-block-overlay'><img onload='image_center_fillsq(this);' src='" + r[i].dp_l + "'/>" + r[i].name + "</div></div>" + 
             "<div style='display: none;' id='peopledisplaydatabox_" + r[i].id + "' data-dpl='" + r[i].dp_l + "' data-uname='" + r[i].name + "'>" + r[i].status + "</div></td>";
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

function people_show_profile(userid, fid)
{
    page_show('profile');
    var o = document.getElementById('peopledisplaydatabox_' + userid);
    if(!o) return 0;

    var uname = o.getAttribute('data-uname');
    var dpl = o.getAttribute('data-dpl');
    document.getElementById('profile-btn-add').onclick = function(){send_friendship_request(uname, fid);};//"alert('" + userid + "', '" + uname + "', '');";
    document.getElementById('profile-btn-sendmsg').onclick = function(){private_message_send_init(uname, fid, '');};

    document.getElementById('profileperson-name').innerHTML = "<h1>" + uname + "</h1>";
    document.getElementById('profileperson-dsc').innerHTML = "<p>" + o.innerHTML + "</p>";
    document.getElementById('profile-info-dp').innerHTML = "<img src='" + dpl + "' onload='image_center_fillsq(this);'>";
}




/* introduction ---------------------------------------------------- */

function introduction_display()
{
    var parent = this;
    
    document.getElementById('intro-uname').innerHTML = "Hello";
    document.getElementById('intro-text').onmousedown = function(){};
    document.getElementById('intro-text').onmouseup = function(){};
    document.getElementById('intro-header').innerHTML = "Welcome to Roadhouse";
    document.getElementById('intro-details').innerHTML = "Swipe left to find out what's happening around you...";   

    if(!settings.lastuser.uid || !secure_key || secure_key === "0")
    {
        setTimeout(function(){page_show("loginui");}, 0);
        return 0;
    }

    if(!settings.laststate.roomid)
    {
        return 0;
    }


    if(cache_lastroom)
    {
        if(cache_lastroom.id === settings.laststate.roomid)
        {
            this.display(cache_lastroom);
        }else{
            server_call("api/rooms/get_info", "id=" + settings.laststate.roomid, function(r){
                cache_lastroom = r;
                this.display(r);
            });
        }
    }else{
        server_call("api/rooms/get_info", "id=" + settings.laststate.roomid, function(r){
            cache_lastroom = r;
            this.display(r);
        });
    }

    this.display = function(r)
    {
       
        document.getElementById('intro-uname').innerHTML = settings.lastuser.uname;
        document.getElementById('intro-text').onmousedown = function(){swiped = 0};
        document.getElementById('intro-text').onmouseup = function(){if(!swiped) conversation_display(settings.laststate.roomid)};
        document.getElementById('intro-header').innerHTML = r.name;
        document.getElementById('intro-details').innerHTML = r.dsc + " | " + r.address;    

        if(r.dp)
        {
            document.getElementById('intro-photos-large').innerHTML = "<img src='" + r.dp + "' onload='image_center_block(this);'/>";
        }else{
             document.getElementById('intro-photos-large').innerHTML = "";
        }
    }
}


/* creating posts and stuff ---------------------------------------- */



function post_publish()
{
    if(!settings.laststate.convid) return 0;

    var v = document.getElementById('newpost-text-post').value;
    if(v == "") return 0;

    server_call("api/conversations/post", "convid=" + settings.laststate.convid + "&postid=0&type=text&text=" + v, function(r){

        if(r)
        {
            if(r.result === "success")
            {
                if(newpost_imageset.length > 0 && r.objid)
                {
                    photo_upload_post(r.objid, settings.laststate.convid, newpost_imageset);
                    document.getElementById('newpost-text-post').value = "";
                }
                conversation_display(settings.laststate.roomid);
            }
        }
        

    });

}

function post_mark(convid, postid, noteid, isup)
{
    var s = "convid=" + convid + "&postid=" + postid + "&noteid=" + noteid;

    if(isup)
    {
        
        server_call("api/conversations/up", s, function(r){

            if(r)
            {
               // if(r.result === "success")
                {
                    var o = document.getElementById('postvotecount_' + postid);
                    if(o)
                    {
                        o.innerHTML = (parseInt(o.innerHTML) + 1);
                        o.className = "post-extra-icon-big"
                        setTimeout(function () {
                          o.className = "post-extra-icon-big action"
                        }, 0);
                        
                    }
                }
            }
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
    get_location(function(lt, lg){

        var s = "name=" + document.getElementById('newroom-name').value +
        "&lat=" + lt +
        "&long=" + lg +
        "&size=" + 50 +
        "&dsc=" + document.getElementById('newroom-dsc').value +
        "&address=" + document.getElementById('newroom-address').value + 
        "&ticketurl=" + document.getElementById('newroom-ticketurl').value;

        server_call("api/rooms/create", s, function(r){

            if(r)
            {
                if(newroom_imageset.length > 0 && r.objid)
                {
                    photo_upload_roomdp(r.objid, newroom_imageset[0]);
                }

                document.getElementById('newroom-name').value = "";
                document.getElementById('newroom-dsc').value = "";
                document.getElementById('newroom-address').value = "";
                document.getElementById('newroom-ticketurl').value = "";
            }
        });

    }); 

   

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
        mouseEvent.handled = false;
    }); 

    var o = document.getElementById('rmapcover');
    if(o)
    {
        o.style.display = "";
        o.onmousedown = function(e){swiped = 0;}
        o.onmouseup = function(e){if(!swiped){o.style.display = "none";}}
    }
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
            s += "<div class='schedule-item' onmousedown='swiped=0;' onmouseup='if(!swiped)conversation_display(\"" + r[i].id + "\")'>" +
                    "<div class='schedule-item-img'>" +
                        "<img src='" + r[i].dp + "'/>" +
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


function camera_clear()
{
    /*camera_backpanel = "newpost";
    camera_set_callback(newpost_photo_event); */
    camera_tempimageid = 0;

    var cameraset = document.getElementById("cameraset");
    cameraset.innerHTML = "";
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


function settings_profile_photo_event(imgdata)
{
    if(!imgdata) return 0;
    if(imgdata.length < 1) return 0;

    document.getElementById('sprofile_dp').src = imgdata[0];
    photo_upload_userdp(imgdata[0]);
}

function settings_profile_addphoto(mode)
{
    camera_backpanel = "settings1";
    camera_set_callback(settings_profile_photo_event);
    page_show_dialog("camera1");
}



/* room information ---------------------------------------------------------- */

var room_map = null;

function room_info_initialize()
{
    room_map = new Microsoft.Maps.Map(document.getElementById('rinfo_rmap'), {credentials: 'AlzEMHjU5aY8KPCt4FIgmwH3XuVLrs4QpfmZ0S7YDb7MlM1WjlAnTEeE01nGD3Nv',
        center: new Microsoft.Maps.Location(settings.laststate.lat, settings.laststate.lng), zoom: 14, mapTypeId: Microsoft.Maps.MapTypeId.road,
        showDashboard: false});

    room_map.entities.clear(); 

    var pushpinOptions = {width: null, height: null, htmlContent: "<div style='border: 8px solid #e9d100; width: 14px; height: 14px; border-radius: 14px;'></div>"}; 
    var pushpin = new Microsoft.Maps.Pushpin(room_map.getCenter(), pushpinOptions);
    room_map.entities.push(pushpin);

    /* load room info */

    if(cache_lastroom)
    {
        if(cache_lastroom.id === settings.laststate.roomid)
        {

            document.getElementById('roominfo-title').innerHTML = cache_lastroom.name;
            document.getElementById('roominfo-dsc').innerHTML = "<p>" + cache_lastroom.dsc + " | " + cache_lastroom.address + "</p>";  
            var pushpinOptions = {width: null, height: null, htmlContent: "<div style='border: 8px solid #e90000; width: 14px; height: 14px; border-radius: 14px;'></div>"}; 
            var pushpin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(cache_lastroom.loc[0], cache_lastroom.loc[1]), pushpinOptions);
            room_map.entities.push(pushpin);
        }else{
            server_call("api/rooms/get_info", "id=" + settings.laststate.roomid, function(r){
                cache_lastroom = r;
                this.display(r);
            });
        }
    }else{
        server_call("api/rooms/get_info", "id=" + settings.laststate.roomid, function(r){
            cache_lastroom = r;
            this.display(r);
        });
    }


    this.display = function(r)
    {
        document.getElementById('roominfo-title').innerHTML = r.name;
        document.getElementById('roominfo-dsc').innerHTML = "<p>" + r.dsc + " | " + r.address + "</p>";  
        var pushpinOptions = {width: null, height: null, htmlContent: "<div style='border: 8px solid #e90000; width: 14px; height: 14px; border-radius: 14px;'></div>"}; 
        var pushpin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(r.loc[0], r.loc[1]), pushpinOptions);
        room_map.entities.push(pushpin);
    };


    document.getElementById('item-info-button-subscribe').style.display = "";
}



/* photo upload ------------------------------------------------------------ */

function photo_upload_userdp(data)
{
    photo_upload_collection("api/photos/set_userdp.json?userid=" + settings.lastuser.uid, data, 0);
}

function photo_upload_roomdp(roomid, data)
{
    photo_upload_collection("api/photos/add_roomdp.json?roomid=" + roomid + "&userid=" + settings.lastuser.uid, data, 0);
}

function photo_upload_post(postid, convid, data)
{
    for(var i=0; i<1; i++)
    {
        photo_upload_collection("api/photos/add_post_photo.json?postid=" + postid + "&userid=" + settings.lastuser.uid + "&convid=" + convid + "&dsc=" + "", data[i], 0);
    }
}


function photo_upload_collection(url, data, progresscallback)
{
    var xhr = new XMLHttpRequest();
    var fd = new FormData();

    var xsrf = getCookie("_xsrf");

    fd.append("upload", data);
    xhr.open("POST", content_url + url + "&_xsrf=" + xsrf);
    
    if(progresscallback)
    {
        xhr.upload.addEventListener("progress", function(e) {
            if (e.lengthComputable)
            {
                var percentage = Math.round((e.loaded * 100) / e.total);
                progresscallback(percentage);
            }}, false);
    }
        
    xhr.setRequestHeader("Content-Type", "image/jpg");
    xhr.setRequestHeader('UP-FILENAME', "photo.jpg");
    xhr.setRequestHeader('UP-SIZE', 100);
    xhr.setRequestHeader('UP-TYPE', "image/jpg");
    
    xhr.send(data);
    
    xhr.onreadystatechange = function(){if(xhr.readyState==4){notice("Upload complete");};}; 
}

function getCookie(name)
{
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}



function roadhouse_logout()
{
    /* clear the cookie */
    //page_show_from_panel("loginui");
    account_logout();
}

function roadhouse_login()
{
    var uname = document.getElementById('loginform_uname').value;
    var upass = document.getElementById('loginform_upass').value;

    return account_login(uname, upass);
}



function account_login(email, passw)
{
    server_call("api/account/login", "email=" + email + "&pass=" + passw, function(r){
        if(r.result)
        {
            if(r.result === "success")
            {
                secure_key = r.key;
                
                if(r.user)
                {
                    settings.lastuser.dp_l = r.user.dp_l;
                    settings.lastuser.dp_s = r.user.dp_s;
                    settings.lastuser.uid = r.user.id;
                    settings.lastuser.uname = r.user.uname;
                    settings.key = secure_key;
                    settings_save();
                }
                page_show("page1", 0);
            }
        }
    });

    return 1;
}

function account_logout(email)
{
    server_call("api/account/logout", "", function(r){
        if(r.result)
        {
            if(r.result === "success")
            {
                settings.lastuser = {uid: 0, uname: "", dp_s: "", dp_l: ""};
                settings_save();
                page_show_from_panel("loginui");
            }
        }
    });
}

function account_deactivate(email, pass)
{
    server_call("api/account/deactivate", "", function(r){
        if(r.result)
        {
            if(r.result === "success")
            {
                page_show_from_panel("loginui");
            }
        }
    });
}

function roadhouse_newaccount()
{
    var loginnew_ufname = document.getElementById('loginnew_ufname').value;
    var loginnew_ulname = document.getElementById('loginnew_ulname').value;
    var loginnew_dsc = document.getElementById('loginnew_dsc').value;
    var loginnew_email = document.getElementById('loginnew_email').value;
    var loginnew_upass = document.getElementById('loginnew_upass').value;
    var loginnew_upassc = document.getElementById('loginnew_upassc').value;

    if(loginnew_upass !== loginnew_upassc)
    {
        notice("Error: Passwords do not match.");
        return 0;
    }


    server_call("api/account/create_account", "fname=" + loginnew_ufname +
                            "&lname="       + loginnew_ulname +
                            "&username="    + "" +
                            "&email="       + loginnew_email +
                            "&password="    + loginnew_upass +
                            "&description=" + loginnew_dsc +
                            "&status="      + "", function(r){

        if(r.result)
        {
            if(r.result === "success")
            {
                secure_key = r.key;

                if(r.user)
                {
                    settings.lastuser.dp_l = r.user.dp_l;
                    settings.lastuser.dp_s = r.user.dp_s;
                    settings.lastuser.uid = r.user.id;
                    settings.lastuser.uname = r.user.uname;
                    settings.key = secure_key;
                    settings_save();
                }
                page_show("settings1");
            }
        }
    });
}





/* chat/messages -------------------------------------------------------------*/

function private_message_send_init(uname, uid, dp)
{
    document.getElementById('sendmsg-username').innerHTML = uname;
    document.getElementById('sendmsg-button').setAttribute('data-uid', uid);
    page_show("sendmsg");
}

function private_message_send_init(uname, uid, dp)
{
    document.getElementById('sendmsg-username').innerHTML = uname;
    document.getElementById('sendmsg-button').setAttribute('data-uid', uid);
    page_show("sendmsg");
}

function private_message_send()
{
    var uid = document.getElementById('sendmsg-button').getAttribute('data-uid');
    var msg = document.getElementById('sendmsg-text').value;
    
    msg = msg.replace(/\n/g, '[-n-l-]');

    server_call("api/notifications/send_message", "uid=" + uid + "&msg=" + msg, function(r){

        document.getElementById('sendmsg-text').value = "";
    });
}

function send_friendship_request(uname, uid)
{
    server_call("api/notifications/send_friend_request", "uid=" + uid, function(r){

        if(r.result)
        {
            if(r.result === "success")
            {
                notice("Your friendship request was sent.");
            }else{
                notice("An error occured.");
            }
        }else{
            notice("An error occured.");
        }
    });
}

function send_friendship_request_action(uid, isaccepted, obj)
{
     server_call("api/people/respond_to_friend_request", "uid=" + uid + "&accepted=" + isaccepted, function(r){

        if(r.result)
        {
            if(r.result === "success")
            {
                if(obj.parentNode)
                {
                    if(obj.parentNode.parentNode)
                        obj.parentNode.parentNode.style.display = "none";
                }
            }
        }
    });
}

/* information display -----------------------------------------------------*/


function item_info_croom_subscribe(btn)
{
    if(!settings.laststate.roomid) return 0;
    server_call("api/rooms/subscribe", "id=" + settings.laststate.roomid, function(r){

        if(btn)btn.style.display = "none";
    });
}

function item_info_croom_newmsg(btn)
{

}

function item_info_croom_newphoto(btn)
{
    capture_image(roomedit_photo_event, "page2");
}

function roomedit_photo_event(imgdata)
{
    photo_upload_roomdp(settings.laststate.roomid, imgdata);
}


/* settings ---------------------------------------------------------------------- */


function settings_load_account()
{
    document.getElementById('sprofile_dp').src = settings.lastuser.dp_l;

    server_call("api/people/get", "id=" + settings.lastuser.uid, function(r){

        document.getElementById('settingsp_fname').value = r.fname;
        document.getElementById('settingsp_lname').value = r.lname;
        document.getElementById('settingsp_username').value = r.username;
        document.getElementById('settingsp_dsc').value = r.description;
        document.getElementById('settingsp_email').value = r.email;
    });
    
}

function settings_profile_save()
{
    var settingsp_fname    = document.getElementById('settingsp_fname').value;
    var settingsp_lname    = document.getElementById('settingsp_lname').value;
    var settingsp_username = document.getElementById('settingsp_username').value;
    var settingsp_dsc      = document.getElementById('settingsp_dsc').value;
    var settingsp_email    = document.getElementById('settingsp_email').value;
    var settingsp_newpass  = document.getElementById('settingsp_newpass').value;
    var settingsp_newpassc = document.getElementById('settingsp_newpassc').value;
    var settingsp_cpass    = document.getElementById('settingsp_cpass').value;

    if(settingsp_newpass !== settingsp_newpassc) return 0;


    server_call("api/people/update", "fname=" + settingsp_fname + "&lname=" + settingsp_lname + "&cpassword=" + settingsp_cpass + 
                    "&username=" + settingsp_username + "&email=" + settingsp_email + "&password=" + settingsp_newpass + "&description=" + settingsp_dsc, function(r){

        page_show("page1"); 
    });
}


