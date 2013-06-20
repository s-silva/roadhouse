var notification_msgs = [];
var notification_msgs_count = 0;

function notifications_initialize()
{
	
}


function notifications_display()
{
	page_show("notifications", 0);
	notification_msgs = [];
	var o = document.getElementById("notification-button");
	if(o) o.style.display = "none";
}

/*
 
  data
    mtype
  	timestamp
  	ctext [msg]
  	user
  	  fname
  	  lname
  	  uid
  	  dp_s
  	  dp_l
  	roomid
  	convid
  	postid
    noteid * optional

*/

function notification_format(data)
{
	var username = "Anonymous";
	var userdp = "";
	var timestamp = new Date().getTime();
	var action = "";
	var btns = "";
	var txt = "";
	var uid = "";

	if(data.timestamp) timestamp = data.timestamp.$date;
	if(data.user)
	{
		username = data.user.fname + " " + data.user.lname;
		userdp = data.user.dp_s;
		uid = data.user.uid;
	}

	if(data.mtype == "friendship")
	{
		txt = "Sent a friendship request.";
		btns = "<div style='padding-top: 10px;'><div class='notification-item-btn' onclick='send_friendship_request_action(\"" + uid + "\", 0, this);'>Reject</div><div class='notification-item-btn' onclick='send_friendship_request_action(\"" + uid + "\", 1, this);'>Accept</div><div style='clear: both;'></div></div>";
	
	}else if(data.mtype == "message"){

		data.ctext = data.ctext.replace(/\[\-n\-l\-\]/g, '<br/>');
		txt = "Sent a message: " + data.ctext;

	}else if(data.mtype == "newpost"){

		txt = "Published a new post on room " + data.roomname;
		/* display room */

	}else if(data.mtype == "newnote"){

		txt = "Made a note on your post.";
		/* display post */

	}else if(data.mtype == "upvote"){

		txt = "Upvoted a post you have made.";
		/* display post */
	}

	return "<div onclick='" + action + "'><div class='notification-dp'><img src='" + userdp + "' /></div><div class='notification-item'>" + 
				"<div class='notification-text'><b>" + username + "</b><br/>" + txt + "<br/><abbr class='synctime' data-mode='1' data-ts='" + timestamp + "'></abbr></div>" + btns + "<div style='clear: both;'></div></div></div>";
}


function notification_format_simple(data)
{
	var txt = "", username = "Anon";

	if(data.user)
	{
		username = data.user.fname;
	}

	txt = username + " ";

	if(data.mtype == "friendship")
	{
		txt += "sent a friendship request.";

	}else if(data.mtype == "message"){

		txt += "sent a message: " + data.ctext;

	}else if(data.mtype == "newpost"){

		txt += "published a new post on room " + data.roomname;

	}else if(data.mtype == "newnote"){

		txt += "made a note on your post.";

	}else if(data.mtype == "upvote"){

		txt += "upvoted a post you have made.";
	}

	return txt.substr(0, 25);
}

function notifications_add(data)
{
	/*
		types:

		message from
		new post (subscribed room)
		new note
		upvote

	*/ 

	var marked = 0;

	if(data.marked) marked = data.marked;	
	notification_msgs.push(data);

	if(marked == 1)
	{
		notification_msgs_count++;

		var o = document.getElementById("notification-button");
		if(o)
		{
			o.innerHTML = notification_msgs_count;
			o.style.display = "";
		}
	}

	o = document.getElementById("notification-list");
	if(o)
	{
		o.innerHTML = notification_format(notification_msgs[notification_msgs.length - 1]) + o.innerHTML;
		synctime_set(o);
	}


	if(notification_msgs.length > 0)
		document.getElementById("ntfls_p1").innerHTML = notification_format_simple(notification_msgs[notification_msgs.length - 1]);

	if(notification_msgs.length > 1)
		document.getElementById("ntfls_p2").innerHTML = notification_format_simple(notification_msgs[notification_msgs.length - 2]);

	if(marked == 1)
	{
		if(notification_msgs.length === 1)
		{
			document.getElementById("notification-counter-p").innerHTML = "1 Notification";
		}else{
			document.getElementById("notification-counter-p").innerHTML = notification_msgs_count + " Notifications";
		}
	}
}


function notifications_initialize_pool()
{
	socket_listener.start();
}

function notifications_load()
{
	server_call("api/notifications/get", "", function(r){

        if(r)
        {
        	for(var i=0; i<r.length; i++)
        	{
        		notifications_add(r[i]);
        	}
        }
    });
}


var socket_listener = {
    socket: null,

    start: function()
    {
        var url = socket_url;
        if ("WebSocket" in window)
        {
			socket_listener.socket = new WebSocket(url + "/" + "0");
        } else {
            socket_listener.socket = new MozWebSocket(url + "/" + "0");
        }
		socket_listener.socket.onmessage = function(event)
		{
			notifications_add(JSON.parse(event.data));
		}
    },
};