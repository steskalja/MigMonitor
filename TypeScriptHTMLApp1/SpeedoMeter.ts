///<reference path="Scripts/typings/jquery/jquery.d.ts" />
///<reference path="Scripts/typings/jqueryui/jqueryui.d.ts" />
///<reference path="Scripts/typings/jquery.dataTables/jquery.dataTables.d.ts" />
interface Status {
    Total: number,
    Inbox: number,
    Error: number,
    Migrated: number
}
interface iFiles {
    Total: number,
    iFiles: iFile

}

interface iFile {
    nName: string,
    fPath: string,
    cDate: string
}

class BuildDial {
    iCurrentSpeed: number;
    iTargetSpeed: number;
    bDecrement: boolean;
    job: Object;

    constructor() {
        this.iCurrentSpeed = 20;
        this.iTargetSpeed = 20;
        this.bDecrement = false;
    }

    degToRad(angle) {
    // Degrees to radians
    return ((angle * Math.PI) / 180);
    }

    radToDeg(angle) {
    // Radians to degree
    return ((angle * 180) / Math.PI);
    }

    drawLine(options, line) {
    // Draw a line using the line object passed in
    options.ctx.beginPath();

    // Set attributes of open
    options.ctx.globalAlpha = line.alpha;
    options.ctx.lineWidth = line.lineWidth;
    options.ctx.fillStyle = line.fillStyle;
    options.ctx.strokeStyle = line.fillStyle;
    options.ctx.moveTo(line.from.X,
        line.from.Y);

    // Plot the line
    options.ctx.lineTo(
        line.to.X,
        line.to.Y
    );

    options.ctx.stroke();
    }

    createLine(fromX, fromY, toX, toY, fillStyle, lineWidth, alpha) {
        // Create a line object using Javascript object notation
        return {
            from: {
                X: fromX,
                Y: fromY
            },
            to: {
                X: toX,
                Y: toY
            },
            fillStyle: fillStyle,
            lineWidth: lineWidth,
            alpha: alpha
        };
    }

    drawOuterMetallicArc(options) {
	    /* Draw the metallic border of the speedometer 
	    * Outer grey area
	    */
        options.ctx.beginPath();

        // Nice shade of grey
        options.ctx.fillStyle = "rgb(127,127,127)";

        // Draw the outer circle
        options.ctx.arc(options.center.X,
            options.center.Y,
            options.radius,
            0,
            Math.PI,
            true);

        // Fill the last object
        options.ctx.fill();
    }

    drawInnerMetallicArc(options) {
	    /* Draw the metallic border of the speedometer 
	    * Inner white area
	    */

        options.ctx.beginPath();

        // White
        options.ctx.fillStyle = "rgb(255,255,255)";

        // Outer circle (subtle edge in the grey)
        options.ctx.arc(options.center.X,
            options.center.Y,
            (options.radius / 100) * 90,
            0,
            Math.PI,
            true);

        options.ctx.fill();
    }

    drawMetallicArc(options) {
	    /* Draw the metallic border of the speedometer
	    * by drawing two semi-circles, one over lapping
	    * the other with a bot of alpha transparency
	    */

        this.drawOuterMetallicArc(options);
        this.drawInnerMetallicArc(options);
    }

    drawBackground(options) {
	    /* Black background with alphs transparency to
	    * blend the edges of the metallic edge and
	    * black background
	    */
        var i = 0;

        options.ctx.globalAlpha = 0.2;
        options.ctx.fillStyle = "rgb(0,0,0)";

        // Draw semi-transparent circles
        for (i = (options.center.X - 10); i < options.center.X; i++) {
            options.ctx.beginPath();

            options.ctx.arc(options.center.X,
                options.center.Y,
                i,
                0,
                Math.PI,
                true);

            options.ctx.fill();
        }
    }

    applyDefaultContextSettings(options) {
	    /* Helper  to revert to gauges
	    * default settings
	    */

        options.ctx.lineWidth = 2;
        options.ctx.globalAlpha = 0.5;
        options.ctx.strokeStyle = "rgb(255, 255, 255)";
        options.ctx.fillStyle = 'rgb(255,255,255)';
    }

    drawSmallTickMarks(options) {
	    /* The small tick marks against the coloured
	    * arc drawn every 5 mph from 10 degrees to
	    * 170 degrees.
	    */

        var tickvalue = options.levelRadius - 8,
            iTick = 0,
            gaugeOptions = options.gaugeOptions,
            iTickRad = 0,
            onArchX,
            onArchY,
            innerTickX,
            innerTickY,
            fromX,
            fromY,
            line,
            toX,
            toY;

        this.applyDefaultContextSettings(options);

        // Tick every 20 degrees (small ticks)
        for (iTick = 10; iTick < 180; iTick += 20) {

            iTickRad = this.degToRad(iTick);

		    /* Calculate the X and Y of both ends of the
		    * line I need to draw at angle represented at Tick.
		    * The aim is to draw the a line starting on the 
		    * coloured arc and continueing towards the outer edge
		    * in the direction from the center of the gauge. 
		    */

            onArchX = gaugeOptions.radius - (Math.cos(iTickRad) * tickvalue);
            onArchY = gaugeOptions.radius - (Math.sin(iTickRad) * tickvalue);
            innerTickX = gaugeOptions.radius - (Math.cos(iTickRad) * gaugeOptions.radius);
            innerTickY = gaugeOptions.radius - (Math.sin(iTickRad) * gaugeOptions.radius);

            fromX = (options.center.X - gaugeOptions.radius) + onArchX;
            fromY = (gaugeOptions.center.Y - gaugeOptions.radius) + onArchY;
            toX = (options.center.X - gaugeOptions.radius) + innerTickX;
            toY = (gaugeOptions.center.Y - gaugeOptions.radius) + innerTickY;

            // Create a line expressed in JSON
            line = this.createLine(fromX, fromY, toX, toY, "rgb(127,127,127)", 3, 0.6);

            // Draw the line
            this.drawLine(options, line);

        }
    }

    drawLargeTickMarks(options) {
	    /* The large tick marks against the coloured
	    * arc drawn every 10 mph from 10 degrees to
	    * 170 degrees.
	    */

        var tickvalue = options.levelRadius - 8,
            iTick = 0,
            gaugeOptions = options.gaugeOptions,
            iTickRad = 0,
            innerTickY,
            innerTickX,
            onArchX,
            onArchY,
            fromX,
            fromY,
            toX,
            toY,
            line;

        this.applyDefaultContextSettings(options);

        tickvalue = options.levelRadius - 2;

        // 10 units (major ticks)
        for (iTick = 20; iTick < 180; iTick += 20) {

            iTickRad = this.degToRad(iTick);

		    /* Calculate the X and Y of both ends of the
		    * line I need to draw at angle represented at Tick.
		    * The aim is to draw the a line starting on the 
		    * coloured arc and continueing towards the outer edge
		    * in the direction from the center of the gauge. 
		    */

            onArchX = gaugeOptions.radius - (Math.cos(iTickRad) * tickvalue);
            onArchY = gaugeOptions.radius - (Math.sin(iTickRad) * tickvalue);
            innerTickX = gaugeOptions.radius - (Math.cos(iTickRad) * gaugeOptions.radius);
            innerTickY = gaugeOptions.radius - (Math.sin(iTickRad) * gaugeOptions.radius);

            fromX = (options.center.X - gaugeOptions.radius) + onArchX;
            fromY = (gaugeOptions.center.Y - gaugeOptions.radius) + onArchY;
            toX = (options.center.X - gaugeOptions.radius) + innerTickX;
            toY = (gaugeOptions.center.Y - gaugeOptions.radius) + innerTickY;

            // Create a line expressed in JSON
            line = this.createLine(fromX, fromY, toX, toY, "rgb(127,127,127)", 3, 0.6);

            // Draw the line
            this.drawLine(options, line);
        }
    }

    drawTicks(options) {
	    /* Two tick in the coloured arc!
	    * Small ticks every 5
	    * Large ticks every 10
	    */
        this.drawSmallTickMarks(options);
        this.drawLargeTickMarks(options);
    }

    drawTextMarkers(options) {
	    /* The text labels marks above the coloured
	    * arc drawn every 10 mph from 10 degrees to
	    * 170 degrees.
	    */
        var innerTickX = 0,
            innerTickY = 0,
            iTick = 0,
            gaugeOptions = options.gaugeOptions,
            iTickToPrint = 0;

        this.applyDefaultContextSettings(options);

        // Font styling
        options.ctx.font = 'italic 10px sans-serif';
        options.ctx.textBaseline = 'top';

        options.ctx.beginPath();

        // Tick every 20 (small ticks)
        for (iTick = 10; iTick < 180; iTick += 20) {

            innerTickX = gaugeOptions.radius - (Math.cos(this.degToRad(iTick)) * gaugeOptions.radius);
            innerTickY = gaugeOptions.radius - (Math.sin(this.degToRad(iTick)) * gaugeOptions.radius);

            // Some cludging to center the values (TODO: Improve)
            if (iTick <= 10) {
                options.ctx.fillText(iTickToPrint, (options.center.X - gaugeOptions.radius - 12) + innerTickX,
                (gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY + 5);
            }
            else if (iTick < 50) {
                options.ctx.fillText(iTickToPrint, (options.center.X - gaugeOptions.radius - 12) + innerTickX - 12,
                (gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY + 5);
            }
            else if (iTick === 50) {
                options.ctx.fillText(iTickToPrint, (options.center.X - gaugeOptions.radius - 12) + innerTickX - 8,
                (gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY);
            }
            else if (iTick < 90) {
                options.ctx.fillText(iTickToPrint, (options.center.X - gaugeOptions.radius - 12) + innerTickX - 4,
                (gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY);
            }
            else if (iTick === 90) {
                options.ctx.fillText(iTickToPrint, (options.center.X - gaugeOptions.radius - 12) + innerTickX + 2,
                (gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY);
            }
            else if (iTick < 145) {
                options.ctx.fillText(iTickToPrint, (options.center.X - gaugeOptions.radius - 12) + innerTickX + 10,
                (gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY);
            }
            else {
                options.ctx.fillText(iTickToPrint, (options.center.X - gaugeOptions.radius - 12) + innerTickX + 15,
                (gaugeOptions.center.Y - gaugeOptions.radius - 12) + innerTickY + 5);
            }

        // MPH increase by 10 every 20 degrees
        //iTickToPrint += Math.round(2160 / 9);
        iTickToPrint += Math.round(options.total / 8);
        console.log(iTickToPrint);
    }

    options.ctx.stroke();
}

 drawSpeedometerPart(options, alphaValue, strokeStyle, startPos) {
	/* Draw part of the arc that represents
	* the colour speedometer arc
	*/

    options.ctx.beginPath();

    options.ctx.globalAlpha = alphaValue;
    options.ctx.lineWidth = 5;
    options.ctx.strokeStyle = strokeStyle;

    options.ctx.arc(options.center.X,
        options.center.Y,
        options.levelRadius,
        Math.PI + (Math.PI / 360 * startPos),
        0 - (Math.PI / 360 * 10),
        false);

    options.ctx.stroke();
}

    drawSpeedometerColourArc(options) {
	/* Draws the colour arc.  Three different colours
	 * used here; thus, same arc drawn 3 times with
	 * different colours.
	 * TODO: Gradient possible?
	 */

    var startOfGreen = 10,
        endOfGreen = 200,
        endOfOrange = 280;

    this.drawSpeedometerPart(options, 1.0, "rgb(82, 240, 55)", startOfGreen);
    this.drawSpeedometerPart(options, 0.9, "rgb(198, 111, 0)", endOfGreen);
    this.drawSpeedometerPart(options, 0.9, "rgb(255, 0, 0)", endOfOrange);

    }

    drawNeedleDial(options, alphaValue, strokeStyle, fillStyle) {
	/* Draws the metallic dial that covers the base of the
	* needle.
	*/
        var i = 0;

        options.ctx.globalAlpha = alphaValue;
        options.ctx.lineWidth = 3;
        options.ctx.strokeStyle = strokeStyle;
        options.ctx.fillStyle = fillStyle;

    // Draw several transparent circles with alpha
        for (i = 0; i < 30; i++) {

            options.ctx.beginPath();
            options.ctx.arc(options.center.X,options.center.Y,i,0,Math.PI,true);
            options.ctx.fill();
            options.ctx.stroke();
        }
    }

    convertSpeedToAngle(options) {
	    /* Helper  to convert a speed to the 
	    * equivelant angle.
	    */
        var tTotal = options.total;
        var iSpeed = options.speed;
        var cSpeed;
        if (tTotal > 80) {
            var tick = (tTotal / 80);
            if (iSpeed == 0) {
                cSpeed = 0;
            }
            else if (iSpeed <= (tick * 5)) {
                cSpeed = 5;
            }
            else if (iSpeed <= (tick * 10)) {
                cSpeed = 10;
            }
            else if (iSpeed <= (tick * 15)) {
                cSpeed = tick * 15;
            }
            else if (iSpeed <= (tick * 20)) {
                cSpeed = 20;
            }
            else if (iSpeed <= (tick * 25)) {
                cSpeed = 25;
            }
            else if (iSpeed <= (tick * 30)) {
                cSpeed = 30;
            }
            else if (iSpeed <= (tick * 35)) {
                cSpeed = 35;
            }
            else if (iSpeed <= (tick * 40)) {
                cSpeed = 40;
            }
            else if (iSpeed <= (tick * 45)) {
                cSpeed = 45;
            }
            else if (iSpeed <= (tick * 50)) {
                cSpeed = 50;
            }
            else if (iSpeed <= (tick * 55)) {
                cSpeed = 55;
            }
            else if (iSpeed <= (tick * 60)) {
                cSpeed = 60;
            }
            else if (iSpeed <= (tick * 65)) {
                cSpeed = 65;
            }
            else if (iSpeed <= (tick * 70)) {
                cSpeed = 70;
            }
            else if (iSpeed <= (tick * 75)) {
                cSpeed = 75;
            }
            else if (iSpeed <= (tick * 80)) {
                cSpeed = 80;
            }
            
        }
        else {
            cSpeed = iSpeed;
        }
        var ciSpeed = (cSpeed / 10);
        var iSpeedAsAngle = ((ciSpeed * 20) + 10) % 180;

        // Ensure the angle is within range
        if (iSpeedAsAngle > 180) {
            iSpeedAsAngle = iSpeedAsAngle - 180;
        }
        else if (iSpeedAsAngle < 0) {
            iSpeedAsAngle = iSpeedAsAngle + 180;
        }

        return iSpeedAsAngle;
    }

    drawNeedle(options) {
	    /* Draw the needle in a nice read colour at the
	    * angle that represents the options.speed value.
	    */

        var iSpeedAsAngle = this.convertSpeedToAngle(options),
        iSpeedAsAngleRad = this.degToRad(iSpeedAsAngle),
        gaugeOptions = options.gaugeOptions,
        innerTickX = gaugeOptions.radius - (Math.cos(iSpeedAsAngleRad) * 20),
        innerTickY = gaugeOptions.radius - (Math.sin(iSpeedAsAngleRad) * 20),
        fromX = (options.center.X - gaugeOptions.radius) + innerTickX,
        fromY = (gaugeOptions.center.Y - gaugeOptions.radius) + innerTickY,
        endNeedleX = gaugeOptions.radius - (Math.cos(iSpeedAsAngleRad) * gaugeOptions.radius),
        endNeedleY = gaugeOptions.radius - (Math.sin(iSpeedAsAngleRad) * gaugeOptions.radius),
        toX = (options.center.X - gaugeOptions.radius) + endNeedleX,
        toY = (gaugeOptions.center.Y - gaugeOptions.radius) + endNeedleY,
        line = this.createLine(fromX, fromY, toX, toY, "rgb(255,0,0)", 5, 0.6);

        this.drawLine(options, line);

        // Two circle to draw the dial at the base (give its a nice effect?)
        this.drawNeedleDial(options, 0.6, "rgb(127, 127, 127)", "rgb(255,255,255)");
        this.drawNeedleDial(options, 0.2, "rgb(127, 127, 127)", "rgb(127,127,127)");

    }

    buildOptionsAsJSON(canvas, iSpeed, tTicks) {
	    /* Setting for the speedometer 
	    * Alter these to modify its look and feel
	    */
        var cCenter: number = (canvas.clientWidth * .5);
        var centerX: number = cCenter;
        var centerY: number = cCenter;
        var radius: number = (centerX * .67);
        var outerRadius: number = (centerX * .9);
        // Create a speedometer object using Javascript object notation

        return {
            ctx: canvas.getContext('2d'),
            speed: iSpeed,
            total: tTicks,
            center: {
                X: centerX,
                Y: centerY
            },
            levelRadius: radius - 10,
            gaugeOptions: {
                center: {
                    X: centerX,
                    Y: centerY
                },
                radius: radius
            },
            radius: outerRadius
        };
    }

    clearCanvas(options) {
        options.ctx.clearRect(0, 0, 800, 600);
        this.applyDefaultContextSettings(options);
    }
}
class CanvasDraw{
    draw(canvasid,fdir = window.location.pathname) {
	    /* Main entry point for drawing the speedometer
	    * If canvas is not support alert the user.
	    */
        
        //var dl: Loaders = new Loaders();
        var data:Status ;
        
        data = this.loadfile("/Status/Overview.json") ;        
        //data = <Status> this.loadfile("Status.txt");
        var cbDial:BuildDial = new BuildDial();
        console.log('Target: ' + cbDial.iTargetSpeed);
        console.log('Current: ' + cbDial.iCurrentSpeed);
        //var fso = new ActiveXObject("Scripting.FileSystemObject"); 
        //var f = fso.GetFolder(fdir);
        var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(canvasid);
        var tCount: number = data.Total;

        var options = null;
        console.log(canvas);
        // Canvas good?
        if (canvas !== null && canvas.getContext) {
            switch (canvas.id) {
                case "Inbox":
                    canvas.title = "Users to be migrated: " + data.Inbox;
                    options = cbDial.buildOptionsAsJSON(canvas, data.Inbox, tCount); 
                    $('#tbl-Inbox').DataTable().destroy();              
                    $('#tbl-Inbox').DataTable({
                        ajax: "/Status/inbox.json",
                        deferRender: true,
                        columns: [
                            { "data": "nName"},
                            { "data": "fPath"},
                            { "data": "cDate" }
                            ]
                    }); 
                    break;
                case "Migrated":
                    canvas.title = "Users Migrated: " + data.Migrated;
                    options = cbDial.buildOptionsAsJSON(canvas, data.Migrated, tCount);
                    $('#tbl-Migrated').DataTable().destroy();
                    $('#tbl-Migrated').DataTable({
                        ajax: "/Status/migrated.json",
                        deferRender: true,
                        serverSide: true,
                        columns: [
                            { "data": "nName" },
                            { "data": "fPath" },
                            { "data": "cDate" }
                        ]
                    }); 
                    break;
                case "Errors":
                    canvas.title = "Migration Errors: " + data.Error;
                    options = cbDial.buildOptionsAsJSON(canvas, data.Error, tCount);
                    $('#tbl-Errors').DataTable().destroy();
                    $('#tbl-Errors').DataTable({
                        ajax: "/Status/errors.json",
                        deferRender: true,
                        columns: [
                            { "data": "nName"},
                            { "data": "fPath"},
                            { "data": "cDate"}
                        ]
                    }); 
                    break;

            };
            // Clear canvas
            cbDial.clearCanvas(options);

            // Draw the metallic styled edge
            cbDial.drawMetallicArc(options);

            // Draw the background
           cbDial.drawBackground(options);

            // Draw tick marks
            cbDial.drawTicks(options);

            // Draw labels on markers
            cbDial.drawTextMarkers(options);

            // Draw speeometer colour arc
            cbDial.drawSpeedometerColourArc(options);

            // Draw the needle and base
            cbDial.drawNeedle(options);

        }
        else {
            alert("Canvas not supported by your browser!");
        }

        if (cbDial.iTargetSpeed == cbDial.iCurrentSpeed) {
            clearTimeout(job);
            return;
        }
        else if (cbDial.iTargetSpeed < cbDial.iCurrentSpeed) {
            cbDial.bDecrement = true;
        }
        else if (cbDial.iTargetSpeed > cbDial.iCurrentSpeed) {
            cbDial.bDecrement = false;
        }

        if (cbDial.bDecrement) {
            if (cbDial.iCurrentSpeed - 10 < cbDial.iTargetSpeed) {
                cbDial.iCurrentSpeed = cbDial.iCurrentSpeed - 1;
            }
            else {
                cbDial.iCurrentSpeed = cbDial.iCurrentSpeed - 5;
            }
        }
        else {

            if (cbDial.iCurrentSpeed + 10 > cbDial.iTargetSpeed) {
                cbDial.iCurrentSpeed = cbDial.iCurrentSpeed + 1;
            }
            else {
                cbDial.iCurrentSpeed = cbDial.iCurrentSpeed + 5;
            }
        }

        var job = setTimeout(this.draw, 5, canvasid,cbDial);
    }
    loadfile(inpFile: string): any {
        var results;
        var xhttp: XMLHttpRequest = new XMLHttpRequest;
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === 4 && xhttp.status === 200) {
                results = eval("(" + xhttp.responseText + ")");
            }
        };
        xhttp.open("GET", inpFile, false);
        xhttp.send();
        return results;
    }


}