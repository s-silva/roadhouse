
var canvas, ctx;
var imgObj;

function image_effect_sepia(img)
{
	var r = [0, 0, 0, 1, 1, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 12, 12, 12, 12, 13, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 17, 18, 19, 19, 20, 21, 22, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 39, 40, 41, 42, 44, 45, 47, 48, 49, 52, 54, 55, 57, 59, 60, 62, 65, 67, 69, 70, 72, 74, 77, 79, 81, 83, 86, 88, 90, 92, 94, 97, 99, 101, 103, 107, 109, 111, 112, 116, 118, 120, 124, 126, 127, 129, 133, 135, 136, 140, 142, 143, 145, 149, 150, 152, 155, 157, 159, 162, 163, 165, 167, 170, 171, 173, 176, 177, 178, 180, 183, 184, 185, 188, 189, 190, 192, 194, 195, 196, 198, 200, 201, 202, 203, 204, 206, 207, 208, 209, 211, 212, 213, 214, 215, 216, 218, 219, 219, 220, 221, 222, 223, 224, 225, 226, 227, 227, 228, 229, 229, 230, 231, 232, 232, 233, 234, 234, 235, 236, 236, 237, 238, 238, 239, 239, 240, 241, 241, 242, 242, 243, 244, 244, 245, 245, 245, 246, 247, 247, 248, 248, 249, 249, 249, 250, 251, 251, 252, 252, 252, 253, 254, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255],
		g = [0, 0, 1, 2, 2, 3, 5, 5, 6, 7, 8, 8, 10, 11, 11, 12, 13, 15, 15, 16, 17, 18, 18, 19, 21, 22, 22, 23, 24, 26, 26, 27, 28, 29, 31, 31, 32, 33, 34, 35, 35, 37, 38, 39, 40, 41, 43, 44, 44, 45, 46, 47, 48, 50, 51, 52, 53, 54, 56, 57, 58, 59, 60, 61, 63, 64, 65, 66, 67, 68, 69, 71, 72, 73, 74, 75, 76, 77, 79, 80, 81, 83, 84, 85, 86, 88, 89, 90, 92, 93, 94, 95, 96, 97, 100, 101, 102, 103, 105, 106, 107, 108, 109, 111, 113, 114, 115, 117, 118, 119, 120, 122, 123, 124, 126, 127, 128, 129, 131, 132, 133, 135, 136, 137, 138, 140, 141, 142, 144, 145, 146, 148, 149, 150, 151, 153, 154, 155, 157, 158, 159, 160, 162, 163, 164, 166, 167, 168, 169, 171, 172, 173, 174, 175, 176, 177, 178, 179, 181, 182, 183, 184, 186, 186, 187, 188, 189, 190, 192, 193, 194, 195, 195, 196, 197, 199, 200, 201, 202, 202, 203, 204, 205, 206, 207, 208, 208, 209, 210, 211, 212, 213, 214, 214, 215, 216, 217, 218, 219, 219, 220, 221, 222, 223, 223, 224, 225, 226, 226, 227, 228, 228, 229, 230, 231, 232, 232, 232, 233, 234, 235, 235, 236, 236, 237, 238, 238, 239, 239, 240, 240, 241, 242, 242, 242, 243, 244, 245, 245, 246, 246, 247, 247, 248, 249, 249, 249, 250, 251, 251, 252, 252, 252, 253, 254, 255],
		b = [53, 53, 53, 54, 54, 54, 55, 55, 55, 56, 57, 57, 57, 58, 58, 58, 59, 59, 59, 60, 61, 61, 61, 62, 62, 63, 63, 63, 64, 65, 65, 65, 66, 66, 67, 67, 67, 68, 69, 69, 69, 70, 70, 71, 71, 72, 73, 73, 73, 74, 74, 75, 75, 76, 77, 77, 78, 78, 79, 79, 80, 81, 81, 82, 82, 83, 83, 84, 85, 85, 86, 86, 87, 87, 88, 89, 89, 90, 90, 91, 91, 93, 93, 94, 94, 95, 95, 96, 97, 98, 98, 99, 99, 100, 101, 102, 102, 103, 104, 105, 105, 106, 106, 107, 108, 109, 109, 110, 111, 111, 112, 113, 114, 114, 115, 116, 117, 117, 118, 119, 119, 121, 121, 122, 122, 123, 124, 125, 126, 126, 127, 128, 129, 129, 130, 131, 132, 132, 133, 134, 134, 135, 136, 137, 137, 138, 139, 140, 140, 141, 142, 142, 143, 144, 145, 145, 146, 146, 148, 148, 149, 149, 150, 151, 152, 152, 153, 153, 154, 155, 156, 156, 157, 157, 158, 159, 160, 160, 161, 161, 162, 162, 163, 164, 164, 165, 165, 166, 166, 167, 168, 168, 169, 169, 170, 170, 171, 172, 172, 173, 173, 174, 174, 175, 176, 176, 177, 177, 177, 178, 178, 179, 180, 180, 181, 181, 181, 182, 182, 183, 184, 184, 184, 185, 185, 186, 186, 186, 187, 188, 188, 188, 189, 189, 189, 190, 190, 191, 191, 192, 192, 193, 193, 193, 194, 194, 194, 195, 196, 196, 196, 197, 197, 197, 198, 199];
	
	var noise = 20;
   
    for (var i=0; i < img.data.length; i+=4)
	{
        img.data[i]   = r[img.data[i]];
        img.data[i+1] = g[img.data[i+1]];
        img.data[i+2] = b[img.data[i+2]];

        if (noise > 0) {
            var n = Math.round(noise - Math.random() * noise);

            for(var j=0; j<3; j++){
                var iPN = n + img.data[i+j];
                img.data[i+j] = (iPN > 255) ? 255 : iPN;
            }
        }
    }
}

function image_effect_grayscale(img)
{
    for (var i=0; i < img.data.length; i+=4)
	{
		var g = img.data[i] * 0.3 + img.data[i+1] * 0.59 + img.data[i+2] * 0.11;

        img.data[i]   = g;
        img.data[i+1] = g;
        img.data[i+2] = g;

    }
}

/* brightness contrast */

function image_effect_addnoise(img)
{
	var noise = 10;
	
    for (var i=0; i < img.data.length; i+=4)
	{
        if (noise > 0)
		{
            var n = Math.round(noise - Math.random() * noise);

            for(var j=0; j<3; j++)
			{
                var iPN = n + img.data[i+j];
                img.data[i+j] = (iPN > 255) ? 255 : iPN;
            }
        }
    }
}


function image_effect_bc(img)
{
	var brightness = 1.0, contrast = 1.1;
    for (var i=0; i < img.data.length; i+=4)
	{
        img.data[i]   = (((img.data[i  ] * brightness) - 128) * contrast + 128);
        img.data[i+1] = (((img.data[i+1] * brightness) - 128) * contrast + 128);
        img.data[i+2] = (((img.data[i+2] * brightness) - 128) * contrast + 128);
    }
}

function image_effect_saturate(img)
{
	var desaturate_level = 0.5;
    for (var i=0; i < img.data.length; i+=4)
	{
		var average = ( img.data[i] + img.data[i+1] + img.data[i+2] ) / 3;

		img.data[i  ] += Math.round( ( average - img.data[i  ] ) * desaturate_level);
		img.data[i+1] += Math.round( ( average - img.data[i+1] ) * desaturate_level);
		img.data[i+2] += Math.round( ( average - img.data[i+2] ) * desaturate_level);
    }
}

function image_effect_tint(img)
{
	var CyanRed      = -40.0;
	var MagentaGreen = 0.0;
	var YellowBlue   = 20.0;
	var r, g, b;

    for (var i=0; i < img.data.length; i+=4)
	{
		r = img.data[i  ];
		g = img.data[i+1];
		b = img.data[i+2];

		r += CyanRed;
		g -= (CyanRed / 2);
		b -= (CyanRed / 2);

		r -= (MagentaGreen / 2);
		g += MagentaGreen;
		b -= (MagentaGreen / 2);

		r -= (YellowBlue / 2);
		g -= (YellowBlue / 2);
		b += YellowBlue;
		
		
		img.data[i  ] = r;
		img.data[i+1] = g;
		img.data[i+2] = b;
    }
}


function image_effect_tint_indie(img)
{
	var CyanRed      = -5.0;
	var MagentaGreen = 0.0;
	var YellowBlue   = 30.0;
	var r, g, b;
	var desaturate_level = 0.8;
	
    for (var i=0; i < img.data.length; i+=4)
	{
		r = img.data[i  ];
		g = img.data[i+1];
		b = img.data[i+2];

		r += CyanRed;
		g -= (CyanRed / 2);
		b -= (CyanRed / 2);

		r -= (MagentaGreen / 2);
		g += MagentaGreen;
		b -= (MagentaGreen / 2);

		r -= (YellowBlue / 2);
		g -= (YellowBlue / 2);
		b += YellowBlue;
		
		
		img.data[i  ] = r;
		img.data[i+1] = g;
		img.data[i+2] = b;
    }
}


function image_effect_vignette(ctx, w, h, strength)
{
	var darkstrength = 0.8;
	var gradient;
	
	if(strength) darkstrength = strength;
	
	var outerRadius = Math.sqrt( Math.pow(w/2, 2) + Math.pow(h/2, 2) );

	ctx.globalCompositeOperation = 'source-over';
	gradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, outerRadius);
	gradient.addColorStop(0, 'rgba(0,0,0,0)');
	gradient.addColorStop(0.2, 'rgba(0,0,0,0)');
	gradient.addColorStop(1, 'rgba(0,0,0,' + darkstrength + ')');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, w, h);
}


function apply_image_effect(cv, fn)
{
	var ctx = cv.getContext('2d');
	
	if(fn == 'center_blur')
	{
	   var blurRadius = 10;
	   var steps = 3;
	   var gradientPixels = getLinearGradientMap(cv.width, cv.height, cv.width/2, cv.height/2, -Math.PI, 320, true );

		var radiusFactor = 1.5;
		var divider = radiusFactor;
		for ( var i = 1; i < steps; i++ )
		{
			divider += Math.pow( radiusFactor, i+1 );
		}
		var startRadius = blurRadius / divider;
		compoundBlurImage( 'srcimg', cv.id, gradientPixels, startRadius, radiusFactor, steps, false );
	
	
	}else{
		var img = ctx.getImageData(0,0,cv.width,cv.height);
		
		if(fn) fn(img);
		
		ctx.putImageData(img, 0, 0);
	}
	
}

function onload()
{
	var canvas, ctx, imgObj;
	
    canvas = document.getElementById('source');
    ctx = canvas.getContext('2d');
	
    imgObj = new Image();
	
    imgObj.onload = function ()
	{
		canvas.style.width = this.width + "px";
		canvas.style.height = this.height + "px";
        ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, canvas.width, canvas.height);
    }
	
    imgObj.src = '5.jpg';
}








function image_fxpreset_cinemascope(canvas_id)
{
	var canvas = document.getElementById(canvas_id);
	var ctx = canvas.getContext('2d');
	
	apply_image_effect(canvas, image_effect_saturate);
	apply_image_effect(canvas, image_effect_addnoise);
	apply_image_effect(canvas, 'center_blur');
	image_effect_vignette(ctx, canvas.width, canvas.height, 0.8);
	apply_image_effect(canvas, image_effect_tint);
	

	/*ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width, 60);
	
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, canvas.height - 60, canvas.width, 60);*/
}

function image_fxpreset_retro(canvas_id)
{
	var canvas = document.getElementById(canvas_id);
	var ctx = canvas.getContext('2d');
	
	apply_image_effect(canvas, image_effect_sepia);
	apply_image_effect(canvas, 'center_blur');
	image_effect_vignette(ctx, canvas.width, canvas.height, 0.8);
}

function image_fxpreset_bnw(canvas_id)
{
	var canvas = document.getElementById(canvas_id);
	var ctx = canvas.getContext('2d');
	
	apply_image_effect(canvas, image_effect_grayscale);
	apply_image_effect(canvas, image_effect_bc);
}

function image_fxpreset_focus(canvas_id)
{
	var canvas = document.getElementById(canvas_id);
	var ctx = canvas.getContext('2d');
	
	apply_image_effect(canvas, image_effect_bc);
	apply_image_effect(canvas, 'center_blur');
	image_effect_vignette(ctx, canvas.width, canvas.height, 0.3);
}

function image_fxpreset_indie(canvas_id)
{
	var canvas = document.getElementById(canvas_id);
	var ctx = canvas.getContext('2d');
	
	apply_image_effect(canvas, image_effect_saturate);
	apply_image_effect(canvas, image_effect_sepia);
	apply_image_effect(canvas, image_effect_addnoise);
	apply_image_effect(canvas, 'center_blur');
	apply_image_effect(canvas, image_effect_tint_indie);
	

	/*ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.width, 60);
	
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, canvas.height - 60, canvas.width, 60);*/
}


















/* compound blur */


/*

CompoundBlur - Blurring with varying radii for Canvas

Version: 	0.1
Author:		Mario Klingemann
Contact: 	mario@quasimondo.com
Website:	http://www.quasimondo.com/StackBlurForCanvas
Twitter:	@quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Copyright (c) 2011 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

var mul_table = [
        512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,
        454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,
        482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,
        437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,
        497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,
        320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,
        446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,
        329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,
        505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,
        399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,
        324,320,316,312,309,305,301,298,294,291,287,284,281,278,274,271,
        268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,
        451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,
        385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,
        332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,
        289,287,285,282,280,278,275,273,271,269,267,265,263,261,259];
        
   
var shg_table = [
	     9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 
		17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 
		19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
		20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
		21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
		21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 
		22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
		22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 
		23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
		23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
		23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 
		23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 
		24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
		24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
		24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
		24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24 ];

		
function compoundBlurImage( imageID, canvasID, radiusData, minRadius, increaseFactor, blurLevels, blurAlphaChannel )
{

       
	var canvas = document.getElementById( canvasID );
    var context = canvas.getContext("2d");
   	var w = canvas.width;
    var h = canvas.height;

	if ( isNaN(minRadius) || minRadius <= 0 || isNaN(increaseFactor) || increaseFactor == 0 ) return;
	
	if ( blurAlphaChannel )
		compundBlurCanvasRGBA( canvasID, 0, 0, w, h, radiusData, minRadius, increaseFactor, blurLevels );
	else 
		compundBlurCanvasRGB( canvasID, 0, 0, w, h, radiusData, minRadius, increaseFactor, blurLevels );
}

function getLinearGradientMap( width, height, centerX, centerY, angle, length, mirrored )
{
	var cnv = document.createElement('canvas');
	cnv.width  = width;
	cnv.height = height;
	
	var x1 = centerX + Math.cos( angle ) * length * 0.5;
	var y1 = centerY + Math.sin( angle ) * length * 0.5;
	
	var x2 = centerX - Math.cos( angle ) * length * 0.5;
	var y2 = centerY - Math.sin( angle ) * length * 0.5;
	
	var context = cnv.getContext("2d");
    var gradient = context.createLinearGradient(x1, y1, x2, y2);
	if ( !mirrored )
	{
		gradient.addColorStop(0, "white");
		gradient.addColorStop(1, "black");
	} else {
		gradient.addColorStop(0, "white");
		gradient.addColorStop(0.5, "black");
		gradient.addColorStop(1, "white");
	}
	context.fillStyle = gradient;
	context.fillRect(0, 0, width, height );
	return context.getImageData( 0, 0, width, height );
}

function getRadialGradientMap( width, height, centerX, centerY, radius1, radius2 )
{
	var cnv = document.createElement('canvas');
	cnv.width  = width;
	cnv.height = height;
	
	
	var context = cnv.getContext("2d");
    var gradient = context.createRadialGradient(centerX, centerY, radius1, centerX, centerY, radius2);
	
	gradient.addColorStop(1, "white");
	gradient.addColorStop(0, "black");
	
	context.fillStyle = gradient;
	context.fillRect(0, 0, width, height );
	return context.getImageData( 0, 0, width, height );
}

function compundBlurCanvasRGB( id, top_x, top_y, width, height, radiusData, minRadius, increaseFactor, blurLevels )
{
	if ( isNaN(minRadius) || minRadius <= 0 || isNaN(increaseFactor) || increaseFactor == 0 ) return;
	 
	var canvas  = document.getElementById( id );
	var context = canvas.getContext("2d");
	var imageData;
	
	try {
	  try {
		imageData = context.getImageData( top_x, top_y, width, height );
	  } catch(e) {
	  
		// NOTE: this part is supposedly only needed if you want to work with local files
		// so it might be okay to remove the whole try/catch block and just use
		// imageData = context.getImageData( top_x, top_y, width, height );
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			imageData = context.getImageData( top_x, top_y, width, height );
		} catch(e) {
			alert("Cannot access local image");
			throw new Error("unable to access local image data: " + e);
			return;
		}
	  }
	} catch(e) {
	  alert("Cannot access image");
	  throw new Error("unable to access image data: " + e);
	}
		
	renderCompundBlurRGB( imageData, radiusData, width, height, minRadius, increaseFactor, blurLevels );
	context.putImageData( imageData, top_x, top_y );	
}

function compundBlurCanvasRGBA( id, top_x, top_y, width, height, radiusData, minRadius, increaseFactor, blurLevels )
{
	if ( isNaN(minRadius) || minRadius <= 0 || isNaN(increaseFactor) || increaseFactor == 0 ) return;
	 
	var canvas  = document.getElementById( id );
	var context = canvas.getContext("2d");
	var imageData;
	
	try {
	  try {
		imageData = context.getImageData( top_x, top_y, width, height );
	  } catch(e) {
	  
		// NOTE: this part is supposedly only needed if you want to work with local files
		// so it might be okay to remove the whole try/catch block and just use
		// imageData = context.getImageData( top_x, top_y, width, height );
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			imageData = context.getImageData( top_x, top_y, width, height );
		} catch(e) {
			alert("Cannot access local image");
			throw new Error("unable to access local image data: " + e);
			return;
		}
	  }
	} catch(e) {
	  alert("Cannot access image");
	  throw new Error("unable to access image data: " + e);
	}
		
	renderCompundBlurRGBA( imageData, radiusData, width, height, minRadius, increaseFactor, blurLevels );
	context.putImageData( imageData, top_x, top_y );	
}
		
function renderCompundBlurRGB( imageData, radiusData, width, height, radius, increaseFactor, blurLevels )
{
	var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum,
	r_out_sum, g_out_sum, b_out_sum,
	r_in_sum, g_in_sum, b_in_sum,
	pr, pg, pb, rbs;
	
	var imagePixels = imageData.data;
	var radiusPixels = radiusData.data;
	
	var wh = width * height;
	var wh4 = wh << 2;
	var pixels = [];
	
	for ( var i = 0; i < wh4; i++ )
	{
		pixels[i] = imagePixels[i];
	}
	
	var currentIndex = 0;
	var steps = blurLevels;
	blurLevels -= 1;
	
	while ( steps-- >= 0 )
	{
		var iradius = ( radius + 0.5 ) | 0;
		if ( iradius == 0 ) continue;
		if ( iradius > 256 ) iradius = 256;
		
		var div = iradius + iradius + 1;
		var w4 = width << 2;
		var widthMinus1  = width - 1;
		var heightMinus1 = height - 1;
		var radiusPlus1  = iradius + 1;
		var sumFactor = radiusPlus1 * ( radiusPlus1 + 1 ) / 2;
		
		var stackStart = new BlurStack();
		var stack = stackStart;
		for ( i = 1; i < div; i++ )
		{
			stack = stack.next = new BlurStack();
			if ( i == radiusPlus1 ) var stackEnd = stack;
		}
		stack.next = stackStart;
		var stackIn = null;
		var stackOut = null;
		
		yw = yi = 0;
		
		var mul_sum = mul_table[iradius];
		var shg_sum = shg_table[iradius];
	
		for ( y = 0; y < height; y++ )
		{
			r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
			
			r_out_sum = radiusPlus1 * ( pr = pixels[yi] );
			g_out_sum = radiusPlus1 * ( pg = pixels[yi+1] );
			b_out_sum = radiusPlus1 * ( pb = pixels[yi+2] );
			
			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;
			
			stack = stackStart;
			
			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack = stack.next;
			}
			
			for( i = 1; i < radiusPlus1; i++ )
			{
				p = yi + (( widthMinus1 < i ? widthMinus1 : i ) << 2 );
				r_sum += ( stack.r = ( pr = pixels[p])) * ( rbs = radiusPlus1 - i );
				g_sum += ( stack.g = ( pg = pixels[p+1])) * rbs;
				b_sum += ( stack.b = ( pb = pixels[p+2])) * rbs;
				
				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;
				
				stack = stack.next;
			}
		
		
			stackIn = stackStart;
			stackOut = stackEnd;
			for ( x = 0; x < width; x++ )
			{
				pixels[yi]   = (r_sum * mul_sum) >> shg_sum;
				pixels[yi+1] = (g_sum * mul_sum) >> shg_sum;
				pixels[yi+2] = (b_sum * mul_sum) >> shg_sum;
				
				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;
				
				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;
				
				p =  ( yw + ( ( p = x + radiusPlus1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;
				
				r_in_sum += ( stackIn.r = pixels[p]);
				g_in_sum += ( stackIn.g = pixels[p+1]);
				b_in_sum += ( stackIn.b = pixels[p+2]);
				
				r_sum += r_in_sum;
				g_sum += g_in_sum;
				b_sum += b_in_sum;
				
				stackIn = stackIn.next;
				
				r_out_sum += ( pr = stackOut.r );
				g_out_sum += ( pg = stackOut.g );
				b_out_sum += ( pb = stackOut.b );
				
				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;
				
				stackOut = stackOut.next;

				yi += 4;
			}
			yw += width;
		}

	
		for ( x = 0; x < width; x++ )
		{
			g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;
			
			yi = x << 2;
			r_out_sum = radiusPlus1 * ( pr = pixels[yi]);
			g_out_sum = radiusPlus1 * ( pg = pixels[yi+1]);
			b_out_sum = radiusPlus1 * ( pb = pixels[yi+2]);
			
			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;
			
			stack = stackStart;
			
			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack = stack.next;
			}
			
			yp = width;
			
			for( i = 1; i < radiusPlus1; i++ )
			{
				yi = ( yp + x ) << 2;
				
				r_sum += ( stack.r = ( pr = pixels[yi])) * ( rbs = radiusPlus1 - i );
				g_sum += ( stack.g = ( pg = pixels[yi+1])) * rbs;
				b_sum += ( stack.b = ( pb = pixels[yi+2])) * rbs;
				
				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;
				
				stack = stack.next;
			
				if( i < heightMinus1 )
				{
					yp += width;
				}
			}
			
			yi = x;
			stackIn = stackStart;
			stackOut = stackEnd;
			for ( y = 0; y < height; y++ )
			{
				p = yi << 2;
				pixels[p]   = (r_sum * mul_sum) >> shg_sum;
				pixels[p+1] = (g_sum * mul_sum) >> shg_sum;
				pixels[p+2] = (b_sum * mul_sum) >> shg_sum;
				
				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;
				
				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;
				
				p = ( x + (( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;
				
				r_sum += ( r_in_sum += ( stackIn.r = pixels[p]));
				g_sum += ( g_in_sum += ( stackIn.g = pixels[p+1]));
				b_sum += ( b_in_sum += ( stackIn.b = pixels[p+2]));
				
				stackIn = stackIn.next;
				
				r_out_sum += ( pr = stackOut.r );
				g_out_sum += ( pg = stackOut.g );
				b_out_sum += ( pb = stackOut.b );
				
				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;
				
				stackOut = stackOut.next;
				
				yi += width;
			}
		}
	
		radius *= increaseFactor;
		
		for ( i = wh; --i > -1 ; )
		{
			var idx = i << 2;
			var lookupValue = (radiusPixels[idx+2] & 0xff) / 255.0 * blurLevels;
			var index = lookupValue | 0;
			
			if ( index == currentIndex )
			{
				var blend =  256.0 * ( lookupValue - (lookupValue | 0 ));
				var iblend = 256 - blend;
				
				 imagePixels[idx] = (  imagePixels[idx] * iblend + pixels[idx] * blend ) >> 8;
				 imagePixels[idx+1] = (  imagePixels[idx+1] * iblend + pixels[idx+1] * blend) >> 8;
				 imagePixels[idx+2] = (  imagePixels[idx+2] * iblend + pixels[idx+2] * blend) >> 8;
			
			} else if ( index == currentIndex + 1 )
			{
				imagePixels[idx] = pixels[idx];
				imagePixels[idx+1] = pixels[idx+1];
				imagePixels[idx+2] = pixels[idx+2];
				
			}
		}
		currentIndex++;
	}
}

function renderCompundBlurRGBA( imageData, radiusData, width, height, radius, increaseFactor, blurLevels )
{
	var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum,
	r_out_sum, g_out_sum, b_out_sum, a_out_sum,
	r_in_sum, g_in_sum, b_in_sum, a_in_sum,
	pa, pr, pg, pb, rbs;
	
	var imagePixels = imageData.data;
	var radiusPixels = radiusData.data;
	
	var wh = width * height;
	var wh4 = wh << 2;
	var pixels = [];
	
	for ( var i = 0; i < wh4; i++ )
	{
		pixels[i] = imagePixels[i];
	}
	
	var currentIndex = 0;
	var steps = blurLevels;
	blurLevels -= 1;
	
	while ( steps-- >= 0 )
	{
		var iradius = ( radius + 0.5 ) | 0;
		if ( iradius == 0 ) continue;
		if ( iradius > 256 ) iradius = 256;
		
		var div = iradius + iradius + 1;
		var w4 = width << 2;
		var widthMinus1  = width - 1;
		var heightMinus1 = height - 1;
		var radiusPlus1  = iradius + 1;
		var sumFactor = radiusPlus1 * ( radiusPlus1 + 1 ) / 2;
		
		var stackStart = new BlurStack();
		var stack = stackStart;
		for ( i = 1; i < div; i++ )
		{
			stack = stack.next = new BlurStack();
			if ( i == radiusPlus1 ) var stackEnd = stack;
		}
		stack.next = stackStart;
		var stackIn = null;
		var stackOut = null;
		
		yw = yi = 0;
		
		var mul_sum = mul_table[iradius];
		var shg_sum = shg_table[iradius];
	
		for ( y = 0; y < height; y++ )
		{
			r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;
			
			r_out_sum = radiusPlus1 * ( pr = pixels[yi] );
			g_out_sum = radiusPlus1 * ( pg = pixels[yi+1] );
			b_out_sum = radiusPlus1 * ( pb = pixels[yi+2] );
			a_out_sum = radiusPlus1 * ( pa = pixels[yi+3] );
			
			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;
			a_sum += sumFactor * pa;
			
			stack = stackStart;
			
			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack.a = pa;
				stack = stack.next;
			}
			
			for( i = 1; i < radiusPlus1; i++ )
			{
				p = yi + (( widthMinus1 < i ? widthMinus1 : i ) << 2 );
				r_sum += ( stack.r = ( pr = pixels[p])) * ( rbs = radiusPlus1 - i );
				g_sum += ( stack.g = ( pg = pixels[p+1])) * rbs;
				b_sum += ( stack.b = ( pb = pixels[p+2])) * rbs;
				a_sum += ( stack.a = ( pa = pixels[p+3])) * rbs;
				
				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;
				a_in_sum += pa;
				
				stack = stack.next;
			}
			
			
			stackIn = stackStart;
			stackOut = stackEnd;
			for ( x = 0; x < width; x++ )
			{
				pixels[yi+3] = pa = (a_sum * mul_sum) >> shg_sum;
				if ( pa != 0 )
				{
					pa = 255 / pa;
					pixels[yi]   = ((r_sum * mul_sum) >> shg_sum) * pa;
					pixels[yi+1] = ((g_sum * mul_sum) >> shg_sum) * pa;
					pixels[yi+2] = ((b_sum * mul_sum) >> shg_sum) * pa;
				} else {
					pixels[yi] = pixels[yi+1] = pixels[yi+2] = 0;
				}
				
				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;
				a_sum -= a_out_sum;
				
				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;
				a_out_sum -= stackIn.a;
				
				p =  ( yw + ( ( p = x + radiusPlus1 ) < widthMinus1 ? p : widthMinus1 ) ) << 2;
				
				r_in_sum += ( stackIn.r = pixels[p]);
				g_in_sum += ( stackIn.g = pixels[p+1]);
				b_in_sum += ( stackIn.b = pixels[p+2]);
				a_in_sum += ( stackIn.a = pixels[p+3]);
				
				r_sum += r_in_sum;
				g_sum += g_in_sum;
				b_sum += b_in_sum;
				a_sum += a_in_sum;
				
				stackIn = stackIn.next;
				
				r_out_sum += ( pr = stackOut.r );
				g_out_sum += ( pg = stackOut.g );
				b_out_sum += ( pb = stackOut.b );
				a_out_sum += ( pa = stackOut.a );
				
				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;
				a_in_sum -= pa;
				
				stackOut = stackOut.next;

				yi += 4;
			}
			yw += width;
		}

		
		for ( x = 0; x < width; x++ )
		{
			g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;
			
			yi = x << 2;
			r_out_sum = radiusPlus1 * ( pr = pixels[yi]);
			g_out_sum = radiusPlus1 * ( pg = pixels[yi+1]);
			b_out_sum = radiusPlus1 * ( pb = pixels[yi+2]);
			a_out_sum = radiusPlus1 * ( pa = pixels[yi+3]);
			
			r_sum += sumFactor * pr;
			g_sum += sumFactor * pg;
			b_sum += sumFactor * pb;
			a_sum += sumFactor * pa;
			
			stack = stackStart;
			
			for( i = 0; i < radiusPlus1; i++ )
			{
				stack.r = pr;
				stack.g = pg;
				stack.b = pb;
				stack.a = pa;
				stack = stack.next;
			}
			
			yp = width;
			
			for( i = 1; i < radiusPlus1; i++ )
			{
				yi = ( yp + x ) << 2;
				
				r_sum += ( stack.r = ( pr = pixels[yi])) * ( rbs = radiusPlus1 - i );
				g_sum += ( stack.g = ( pg = pixels[yi+1])) * rbs;
				b_sum += ( stack.b = ( pb = pixels[yi+2])) * rbs;
				a_sum += ( stack.a = ( pa = pixels[yi+3])) * rbs;
			   
				r_in_sum += pr;
				g_in_sum += pg;
				b_in_sum += pb;
				a_in_sum += pa;
				
				stack = stack.next;
			
				if( i < heightMinus1 )
				{
					yp += width;
				}
			}
			
			yi = x;
			stackIn = stackStart;
			stackOut = stackEnd;
			for ( y = 0; y < height; y++ )
			{
				p = yi << 2;
				pixels[p+3] = pa = (a_sum * mul_sum) >> shg_sum;
				if ( pa > 0 )
				{
					pa = 255 / pa;
					pixels[p]   = ((r_sum * mul_sum) >> shg_sum ) * pa;
					pixels[p+1] = ((g_sum * mul_sum) >> shg_sum ) * pa;
					pixels[p+2] = ((b_sum * mul_sum) >> shg_sum ) * pa;
				} else {
					pixels[p] = pixels[p+1] = pixels[p+2] = 0;
				}
				
				r_sum -= r_out_sum;
				g_sum -= g_out_sum;
				b_sum -= b_out_sum;
				a_sum -= a_out_sum;
			   
				r_out_sum -= stackIn.r;
				g_out_sum -= stackIn.g;
				b_out_sum -= stackIn.b;
				a_out_sum -= stackIn.a;
				
				p = ( x + (( ( p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1 ) * width )) << 2;
				
				r_sum += ( r_in_sum += ( stackIn.r = pixels[p]));
				g_sum += ( g_in_sum += ( stackIn.g = pixels[p+1]));
				b_sum += ( b_in_sum += ( stackIn.b = pixels[p+2]));
				a_sum += ( a_in_sum += ( stackIn.a = pixels[p+3]));
			   
				stackIn = stackIn.next;
				
				r_out_sum += ( pr = stackOut.r );
				g_out_sum += ( pg = stackOut.g );
				b_out_sum += ( pb = stackOut.b );
				a_out_sum += ( pa = stackOut.a );
				
				r_in_sum -= pr;
				g_in_sum -= pg;
				b_in_sum -= pb;
				a_in_sum -= pa;
				
				stackOut = stackOut.next;
				
				yi += width;
			}
		}
	
		radius *= increaseFactor;
		
		for ( i = wh; --i > -1 ; )
		{
			var idx = i << 2;
			var lookupValue = (radiusPixels[idx+2] & 0xff) / 255.0 * blurLevels;
			var index = lookupValue | 0;
			
			if ( index == currentIndex )
			{
				var blend =  256.0 * ( lookupValue - (lookupValue | 0 ));
				var iblend = 256 - blend;
				
				 imagePixels[idx]   = (imagePixels[idx]   * iblend + pixels[idx]   * blend) >> 8;
				 imagePixels[idx+1] = (imagePixels[idx+1] * iblend + pixels[idx+1] * blend) >> 8;
				 imagePixels[idx+2] = (imagePixels[idx+2] * iblend + pixels[idx+2] * blend) >> 8;
				 imagePixels[idx+3] = (imagePixels[idx+3] * iblend + pixels[idx+3] * blend) >> 8;
			
			} else if ( index == currentIndex + 1 )
			{
				imagePixels[idx]   = pixels[idx];
				imagePixels[idx+1] = pixels[idx+1];
				imagePixels[idx+2] = pixels[idx+2];
				imagePixels[idx+3] = pixels[idx+3];
			}
		}
		currentIndex++;
	}
}
	
function BlurStack()
{
	this.r = 0;
	this.g = 0;
	this.b = 0;
	this.a = 0;
	this.next = null;
}