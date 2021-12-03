"use strict";

if(typeof console === "undefined"){
    console = {};
}

var ACTIVE_ROBOT_NUMBER = 3
    
var canvas;
var gl;

var showMesh, showNormals, showContours, showLightPosition, showTexture;



var SMALL_FIELD = true;


var DEFAULT_CANVAS_FIELD_WIDTH = 10400;
var DEFAULT_CANVAS_FIELD_HEIGHT = 7400;

var CURRENT_CANVAS_FIELD_WIDTH = 6600;
var CURRENT_CANVAS_FIELD_HEIGHT = 4600;

var CURRENT_BORDER_STRIP_WIDTH = 700;

if(SMALL_FIELD)
{
    DEFAULT_CANVAS_FIELD_WIDTH = 7400;
    DEFAULT_CANVAS_FIELD_HEIGHT = 5400;

    CURRENT_CANVAS_FIELD_WIDTH = 7400;
    CURRENT_CANVAS_FIELD_HEIGHT = 5400;

    CURRENT_BORDER_STRIP_WIDTH = 700;
}

var CURRENT_FIELD_WIDTH = CURRENT_CANVAS_FIELD_WIDTH - CURRENT_BORDER_STRIP_WIDTH;
var CURRENT_FIELD_HEIGHT = CURRENT_CANVAS_FIELD_HEIGHT - CURRENT_BORDER_STRIP_WIDTH;

var CANVAS_RESOLUTION_FACTOR = 0.4;

var CANVAS_FIELD_WIDTH = Math.floor(CURRENT_CANVAS_FIELD_WIDTH * CANVAS_RESOLUTION_FACTOR);
var CANVAS_FIELD_HEIGHT = Math.floor(CURRENT_CANVAS_FIELD_HEIGHT * CANVAS_RESOLUTION_FACTOR);

var FIELD_WIDTH = Math.floor(CURRENT_FIELD_WIDTH * CANVAS_RESOLUTION_FACTOR);
var FIELD_HEIGHT = Math.floor(CURRENT_FIELD_HEIGHT * CANVAS_RESOLUTION_FACTOR);

function mapValueToCurrentField(value)
{
    return Utils.mapValue(value, 0, CURRENT_CANVAS_FIELD_WIDTH, 0, DEFAULT_CANVAS_FIELD_WIDTH)
}

function mapValueToCurrentCanvas(value)
{
    return Utils.mapValue(value, 0, CANVAS_FIELD_WIDTH, 0, CURRENT_CANVAS_FIELD_WIDTH);
}

if(SMALL_FIELD)
{
    var FieldDimensions = 
    {
        FIELD_LINES_WIDTH : mapValueToCurrentCanvas(mapValueToCurrentField(50)),

        CENTER_CIRCLE_RADIUS : mapValueToCurrentCanvas(mapValueToCurrentField(750)),
        CENTER_DOT_RADIUS : mapValueToCurrentCanvas(mapValueToCurrentField(35)),

        Y_POS_SIDE_LINE : mapValueToCurrentCanvas(mapValueToCurrentField(2000)),
        X_POS_SIDE_LINE : mapValueToCurrentCanvas(mapValueToCurrentField(3000)),

        PENALTY_AREA_WIDTH : mapValueToCurrentCanvas(mapValueToCurrentField(600)),
        PENALTY_AREA_HEIGHT : mapValueToCurrentCanvas(mapValueToCurrentField(2200)),

        PENALTY_CROSS_SIZE : mapValueToCurrentCanvas(mapValueToCurrentField(100)),
        PENALTY_CROSS_X_DISTANCE : mapValueToCurrentCanvas(mapValueToCurrentField(1300)),
        X_POS_PENALTY_CROSS : this.X_POS_SIDE_LINE - this.PENALTY_CROSS_X_DISTANCE,
        GOAL_POST_RADIUS : mapValueToCurrentCanvas(mapValueToCurrentField(60)),
        GOAL_POST_WIDTH : mapValueToCurrentCanvas(mapValueToCurrentField(500)),
        GOAL_POST_HEIGHT : mapValueToCurrentCanvas(mapValueToCurrentField(1500)),
        TARGET_RADIUS : mapValueToCurrentCanvas(mapValueToCurrentField(100)),
        BALL_RADIUS : mapValueToCurrentCanvas(mapValueToCurrentField(100)),
        ROBOT_RADIUS : mapValueToCurrentCanvas(mapValueToCurrentField(150)),
        OBSTACLE_RADIUS : this.ROBOT_RADIUS,

    }
}
else
{
    var FieldDimensions = 
    {
        FIELD_LINES_WIDTH : mapValueToCurrentCanvas(mapValueToCurrentField(50)),

        CENTER_CIRCLE_RADIUS : mapValueToCurrentCanvas(mapValueToCurrentField(750)),
        CENTER_DOT_RADIUS : mapValueToCurrentCanvas(mapValueToCurrentField(35)),

        Y_POS_SIDE_LINE : mapValueToCurrentCanvas(mapValueToCurrentField(3000)),
        X_POS_SIDE_LINE : mapValueToCurrentCanvas(mapValueToCurrentField(4500)),

        PENALTY_AREA_WIDTH : mapValueToCurrentCanvas(mapValueToCurrentField(1650)),
        PENALTY_AREA_HEIGHT : mapValueToCurrentCanvas(mapValueToCurrentField(4000)),

        GOAL_BOX_WIDTH : mapValueToCurrentCanvas(mapValueToCurrentField(600)),
        GOAL_BOX_HEIGHT : mapValueToCurrentCanvas(mapValueToCurrentField(2200)),

        PENALTY_CROSS_SIZE : mapValueToCurrentCanvas(mapValueToCurrentField(100)),
        PENALTY_CROSS_X_DISTANCE : mapValueToCurrentCanvas(mapValueToCurrentField(1300)),
        X_POS_PENALTY_CROSS : this.X_POS_SIDE_LINE - this.PENALTY_CROSS_X_DISTANCE,
        GOAL_POST_RADIUS : mapValueToCurrentCanvas(mapValueToCurrentField(60)),
        GOAL_POST_WIDTH : mapValueToCurrentCanvas(mapValueToCurrentField(500)),
        GOAL_POST_HEIGHT : mapValueToCurrentCanvas(mapValueToCurrentField(1500)),
        TARGET_RADIUS : mapValueToCurrentCanvas(mapValueToCurrentField(100)),
        BALL_RADIUS : mapValueToCurrentCanvas(mapValueToCurrentField(100)),
        ROBOT_RADIUS : mapValueToCurrentCanvas(mapValueToCurrentField(150)),
        OBSTACLE_RADIUS : this.ROBOT_RADIUS,

    }
}

var fieldBackgroundColor = "#00FF00";
var fieldLinesColor = "#00FF00";
var ballColor = "#00FF00";
var robotColor = "#00FF00";
var obstacleColor = "";
var goalColor = "";
var targetPositionColor = "";

var taskColors = [];
for(var i = 0; i<500; i++)
{
    taskColors[i] = Utils.generateRandomColor();
}

var canvasTextColor = "#FFFFFF";
var canvasContainerBackgroundColor = "#DDDDEE";
var canvasBackgroundColor = "#00BB00";


var robotNumbersToPositions = new Map();
var ballPosition = [0.0, 0.0];
var obstaclesPositions = [];

var taskTypeToTaskLabel = new Map();
var lastReceivedTaskID = -1;
var lastCompletedTaskID = -1;
var currentTaskList = [];
var currentTaskPreviews = [];

var mouseOverCanvas = false;

function drawCircle(ctx, centerX, centerY, radius, fillColor = undefined, lineColor = "#000000", lineWidth = 5, withRespectToCenter = undefined)
{
    if(withRespectToCenter != undefined)
    {
        centerX = centerX + withRespectToCenter[0];
        centerY = centerY + withRespectToCenter[1];
    }

    console.log(centerX)
    console.log(centerY)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    
    if(fillColor == undefined)
        fillColor = canvasBackgroundColor;
        ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.stroke();
}

function drawTextLabel(ctx, xPos, yPos, text, color, size, withRespectToCenter = undefined)
{
    if(withRespectToCenter != undefined)
    {
        xPos = xPos + withRespectToCenter[0];
        yPos = yPos + withRespectToCenter[1];
    }

    ctx.font = size+"px Arial";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(text, xPos, yPos);
}

function drawLine(ctx, fromX, fromY, toX, toY, lineColor = "#000000", lineWidth = 5, withRespectToCenter = undefined)
{
    if(withRespectToCenter != undefined)
    {
        fromX = fromX + withRespectToCenter[0];
        toX = toX + withRespectToCenter[0];

        fromY = fromY + withRespectToCenter[1];
        toY = toY + withRespectToCenter[1];
    }

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.stroke();
}

//Taken from https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
function drawArrow(ctx, fromX, fromY, toX, toY, lineColor = "#000000", lineWidth = 20, arrowHeadLength = 50, withRespectToCenter = undefined) 
{
    if(withRespectToCenter != undefined)
    {
        fromX = fromX + withRespectToCenter[0];
        toX = toX + withRespectToCenter[0];

        fromY = fromY + withRespectToCenter[1];
        toY = toY + withRespectToCenter[1];
    }
    
    var dx = toX - fromX;
    var dy = toY - fromY;
    var angle = Math.atan2(dy, dx);


    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - arrowHeadLength * Math.cos(angle - Math.PI / 6), toY - arrowHeadLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - arrowHeadLength * Math.cos(angle + Math.PI / 6), toY - arrowHeadLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function drawRectangle(ctx, topLeftX, topLeftY, width, length, fillColor = undefined, lineColor = "#000000", lineWidth = 5, withRespectToCenter = undefined)
{
    if(withRespectToCenter != undefined)
    {
        topLeftX = topLeftX + withRespectToCenter[0];
        topLeftY = topLeftY + withRespectToCenter[1];
    }
        
    ctx.fillStyle = fillColor;
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = lineColor;
    ctx.fillRect(topLeftX, topLeftY, width, length); 
    ctx.stroke();

}

function drawField(canvas)
{
    var ctx = canvas.getContext('2d');
    

    drawRectangle(ctx, 0, 0, canvas.width, canvas.height, canvasBackgroundColor, "#FFFFFF", 5)

    //Center circle
    drawCircle(ctx, 0, 0, FieldDimensions.CENTER_CIRCLE_RADIUS, canvasBackgroundColor, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
    drawCircle(ctx, 0, 0, FieldDimensions.CENTER_DOT_RADIUS, canvasBackgroundColor, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);

    //Middle field line
    drawLine(ctx, 0, FieldDimensions.Y_POS_SIDE_LINE, 0, -FieldDimensions.Y_POS_SIDE_LINE, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);

    //Horizontal side lines
    drawLine(ctx, FieldDimensions.X_POS_SIDE_LINE, FieldDimensions.Y_POS_SIDE_LINE, -FieldDimensions.X_POS_SIDE_LINE, FieldDimensions.Y_POS_SIDE_LINE, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
    drawLine(ctx, FieldDimensions.X_POS_SIDE_LINE, -FieldDimensions.Y_POS_SIDE_LINE, -FieldDimensions.X_POS_SIDE_LINE, -FieldDimensions.Y_POS_SIDE_LINE, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);

    //Vertical side lines
    drawLine(ctx, -FieldDimensions.X_POS_SIDE_LINE, -FieldDimensions.Y_POS_SIDE_LINE, -FieldDimensions.X_POS_SIDE_LINE, FieldDimensions.Y_POS_SIDE_LINE, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
    drawLine(ctx, FieldDimensions.X_POS_SIDE_LINE, -FieldDimensions.Y_POS_SIDE_LINE, FieldDimensions.X_POS_SIDE_LINE, FieldDimensions.Y_POS_SIDE_LINE, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);

    //Left penalty area
        //Horizontal lines
        drawLine(ctx, -FieldDimensions.X_POS_SIDE_LINE, -FieldDimensions.PENALTY_AREA_HEIGHT/2, -FieldDimensions.X_POS_SIDE_LINE + FieldDimensions.PENALTY_AREA_WIDTH, -FieldDimensions.PENALTY_AREA_HEIGHT/2, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
        drawLine(ctx, -FieldDimensions.X_POS_SIDE_LINE, FieldDimensions.PENALTY_AREA_HEIGHT/2, -FieldDimensions.X_POS_SIDE_LINE + FieldDimensions.PENALTY_AREA_WIDTH, FieldDimensions.PENALTY_AREA_HEIGHT/2, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);

        //Vertical line
        drawLine(ctx, -FieldDimensions.X_POS_SIDE_LINE + FieldDimensions.PENALTY_AREA_WIDTH, -FieldDimensions.PENALTY_AREA_HEIGHT/2, -FieldDimensions.X_POS_SIDE_LINE + FieldDimensions.PENALTY_AREA_WIDTH, FieldDimensions.PENALTY_AREA_HEIGHT/2, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);

    if(!SMALL_FIELD)
    {
    //Left goal box
        //Horizontal lines
        drawLine(ctx, -FieldDimensions.X_POS_SIDE_LINE, -FieldDimensions.GOAL_BOX_HEIGHT/2, -FieldDimensions.X_POS_SIDE_LINE + FieldDimensions.GOAL_BOX_WIDTH, -FieldDimensions.GOAL_BOX_HEIGHT/2, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
        drawLine(ctx, -FieldDimensions.X_POS_SIDE_LINE, FieldDimensions.GOAL_BOX_HEIGHT/2, -FieldDimensions.X_POS_SIDE_LINE + FieldDimensions.GOAL_BOX_WIDTH, FieldDimensions.GOAL_BOX_HEIGHT/2, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
    
        //Vertical line
        drawLine(ctx, -FieldDimensions.X_POS_SIDE_LINE + FieldDimensions.GOAL_BOX_WIDTH, -FieldDimensions.GOAL_BOX_HEIGHT/2, -FieldDimensions.X_POS_SIDE_LINE + FieldDimensions.GOAL_BOX_WIDTH, FieldDimensions.GOAL_BOX_HEIGHT/2, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
    }

    //Right penalty area
        //Horizontal lines
        drawLine(ctx, FieldDimensions.X_POS_SIDE_LINE, -FieldDimensions.PENALTY_AREA_HEIGHT/2, FieldDimensions.X_POS_SIDE_LINE - FieldDimensions.PENALTY_AREA_WIDTH, -FieldDimensions.PENALTY_AREA_HEIGHT/2, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
        drawLine(ctx, FieldDimensions.X_POS_SIDE_LINE, FieldDimensions.PENALTY_AREA_HEIGHT/2, FieldDimensions.X_POS_SIDE_LINE - FieldDimensions.PENALTY_AREA_WIDTH, FieldDimensions.PENALTY_AREA_HEIGHT/2, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);

        //Vertical line
        drawLine(ctx, FieldDimensions.X_POS_SIDE_LINE - FieldDimensions.PENALTY_AREA_WIDTH, -FieldDimensions.PENALTY_AREA_HEIGHT/2, FieldDimensions.X_POS_SIDE_LINE - FieldDimensions.PENALTY_AREA_WIDTH, FieldDimensions.PENALTY_AREA_HEIGHT/2, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);


    if(!SMALL_FIELD)
    {
    //Right goal box
        //Horizontal lines
        drawLine(ctx, FieldDimensions.X_POS_SIDE_LINE, -FieldDimensions.GOAL_BOX_HEIGHT/2, FieldDimensions.X_POS_SIDE_LINE - FieldDimensions.GOAL_BOX_WIDTH, -FieldDimensions.GOAL_BOX_HEIGHT/2, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
        drawLine(ctx, FieldDimensions.X_POS_SIDE_LINE, FieldDimensions.GOAL_BOX_HEIGHT/2, FieldDimensions.X_POS_SIDE_LINE - FieldDimensions.GOAL_BOX_WIDTH, FieldDimensions.GOAL_BOX_HEIGHT/2, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);

        //Vertical line
        drawLine(ctx, FieldDimensions.X_POS_SIDE_LINE - FieldDimensions.GOAL_BOX_WIDTH, -FieldDimensions.GOAL_BOX_HEIGHT/2, FieldDimensions.X_POS_SIDE_LINE - FieldDimensions.GOAL_BOX_WIDTH, FieldDimensions.GOAL_BOX_HEIGHT/2, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
    }

    //Left penalty cross
    drawLine(ctx, -FieldDimensions.X_POS_PENALTY_CROSS, FieldDimensions.PENALTY_CROSS_SIZE/2, -FieldDimensions.X_POS_PENALTY_CROSS, -FieldDimensions.PENALTY_CROSS_SIZE/2, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
    drawLine(ctx, -FieldDimensions.X_POS_PENALTY_CROSS - FieldDimensions.PENALTY_CROSS_SIZE/2, 0, -FieldDimensions.X_POS_PENALTY_CROSS + FieldDimensions.PENALTY_CROSS_SIZE/2, 0, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);

    //Right penalty cross
    drawLine(ctx, FieldDimensions.X_POS_PENALTY_CROSS, FieldDimensions.PENALTY_CROSS_SIZE/2, FieldDimensions.X_POS_PENALTY_CROSS, -FieldDimensions.PENALTY_CROSS_SIZE/2, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
    drawLine(ctx, FieldDimensions.X_POS_PENALTY_CROSS + FieldDimensions.PENALTY_CROSS_SIZE/2, 0, FieldDimensions.X_POS_PENALTY_CROSS - FieldDimensions.PENALTY_CROSS_SIZE/2, 0, "#FFFFFF", FieldDimensions.FIELD_LINES_WIDTH, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);

    //Left goal post
        //Net
        drawRectangle(ctx, -FieldDimensions.X_POS_SIDE_LINE - FieldDimensions.GOAL_POST_WIDTH, -FieldDimensions.GOAL_POST_HEIGHT/2, FieldDimensions.GOAL_POST_WIDTH, FieldDimensions.GOAL_POST_HEIGHT, "#CCCCCC", "#FFFFFF", 1, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2])
        drawLine(ctx, -FieldDimensions.X_POS_SIDE_LINE - FieldDimensions.GOAL_POST_WIDTH, -FieldDimensions.GOAL_POST_HEIGHT/2, -FieldDimensions.X_POS_SIDE_LINE, -FieldDimensions.GOAL_POST_HEIGHT/2, "#FFFFFF", FieldDimensions.GOAL_POST_RADIUS/2, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
        drawLine(ctx, -FieldDimensions.X_POS_SIDE_LINE - FieldDimensions.GOAL_POST_WIDTH, FieldDimensions.GOAL_POST_HEIGHT/2, -FieldDimensions.X_POS_SIDE_LINE, FieldDimensions.GOAL_POST_HEIGHT/2, "#FFFFFF", FieldDimensions.GOAL_POST_RADIUS/2, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
        drawLine(ctx, -FieldDimensions.X_POS_SIDE_LINE - FieldDimensions.GOAL_POST_WIDTH, -FieldDimensions.GOAL_POST_HEIGHT/2, -FieldDimensions.X_POS_SIDE_LINE - FieldDimensions.GOAL_POST_WIDTH, FieldDimensions.GOAL_POST_HEIGHT/2, "#FFFFFF", FieldDimensions.GOAL_POST_RADIUS/2, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
        
        //Front post
        drawCircle(ctx, -FieldDimensions.X_POS_SIDE_LINE, -FieldDimensions.GOAL_POST_HEIGHT/2 - FieldDimensions.GOAL_POST_RADIUS/2, FieldDimensions.GOAL_POST_RADIUS, "#FFFFFF", "FFFFFF", 5, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
        drawCircle(ctx, -FieldDimensions.X_POS_SIDE_LINE, FieldDimensions.GOAL_POST_HEIGHT/2 + FieldDimensions.GOAL_POST_RADIUS/2, FieldDimensions.GOAL_POST_RADIUS, "#FFFFFF", "FFFFFF", 5, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
        drawLine(ctx, -FieldDimensions.X_POS_SIDE_LINE, -FieldDimensions.GOAL_POST_HEIGHT/2, -FieldDimensions.X_POS_SIDE_LINE, FieldDimensions.GOAL_POST_HEIGHT/2, "#FFFFFF", FieldDimensions.GOAL_POST_RADIUS, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);

    //Right goal post
        //Net
        drawRectangle(ctx, FieldDimensions.X_POS_SIDE_LINE, -FieldDimensions.GOAL_POST_HEIGHT/2, FieldDimensions.GOAL_POST_WIDTH, FieldDimensions.GOAL_POST_HEIGHT, "#CCCCCC", "#FFFFFF", 1, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2])
        drawLine(ctx, FieldDimensions.X_POS_SIDE_LINE, -FieldDimensions.GOAL_POST_HEIGHT/2, FieldDimensions.X_POS_SIDE_LINE + FieldDimensions.GOAL_POST_WIDTH, -FieldDimensions.GOAL_POST_HEIGHT/2, "#FFFFFF", FieldDimensions.GOAL_POST_RADIUS/2, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
        drawLine(ctx, FieldDimensions.X_POS_SIDE_LINE, FieldDimensions.GOAL_POST_HEIGHT/2, FieldDimensions.X_POS_SIDE_LINE + FieldDimensions.GOAL_POST_WIDTH, FieldDimensions.GOAL_POST_HEIGHT/2, "#FFFFFF", FieldDimensions.GOAL_POST_RADIUS/2, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
        drawLine(ctx, FieldDimensions.X_POS_SIDE_LINE + FieldDimensions.GOAL_POST_WIDTH, -FieldDimensions.GOAL_POST_HEIGHT/2, FieldDimensions.X_POS_SIDE_LINE + FieldDimensions.GOAL_POST_WIDTH, FieldDimensions.GOAL_POST_HEIGHT/2, "#FFFFFF", FieldDimensions.GOAL_POST_RADIUS/2, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
        
        //Front post
        drawCircle(ctx, FieldDimensions.X_POS_SIDE_LINE, -FieldDimensions.GOAL_POST_HEIGHT/2 - FieldDimensions.GOAL_POST_RADIUS/2, FieldDimensions.GOAL_POST_RADIUS, "#FFFFFF", "FFFFFF", 1, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
        drawCircle(ctx, FieldDimensions.X_POS_SIDE_LINE, FieldDimensions.GOAL_POST_HEIGHT/2 + FieldDimensions.GOAL_POST_RADIUS/2, FieldDimensions.GOAL_POST_RADIUS, "#FFFFFF", "FFFFFF", 1, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
        drawLine(ctx, FieldDimensions.X_POS_SIDE_LINE, -FieldDimensions.GOAL_POST_HEIGHT/2, FieldDimensions.X_POS_SIDE_LINE, FieldDimensions.GOAL_POST_HEIGHT/2, "#FFFFFF", FieldDimensions.GOAL_POST_RADIUS, [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);

}


function scaleFieldPositionToCanvas(canvas, xFieldPos, yFieldPos)
{
    var boundingRect = canvas.getBoundingClientRect();

    var unscaledMouseXOnCanvas = Math.round(Utils.mapValue(xFieldPos, 0, canvas.width, -Math.floor(CURRENT_CANVAS_FIELD_WIDTH/2), Math.floor(CURRENT_CANVAS_FIELD_WIDTH/2)));
    var unscaledMouseYOnCanvas = Math.round(Utils.mapValue(yFieldPos, 0, canvas.height, -Math.floor(CURRENT_CANVAS_FIELD_HEIGHT/2), Math.floor(CURRENT_CANVAS_FIELD_HEIGHT/2)));

    return [unscaledMouseXOnCanvas, unscaledMouseYOnCanvas]

}

function scaleMousePositionToField(canvas, xPos, yPos)
{
    var boundingRect = canvas.getBoundingClientRect();

    //The canvas bitmap has a different size wrt the actual canvas size, so we need to scale it
    var scaleX = canvas.width / boundingRect.width;    
    var scaleY = canvas.height / boundingRect.height;  

    var mouseXOnCanvas = Math.round((xPos - boundingRect.left) * scaleX);  
    var mouseYOnCanvas = Math.round((yPos - boundingRect.top) * scaleY);     

    var scaledMouseXOnCanvas = Math.round(Utils.mapValue(mouseXOnCanvas, -Math.floor(CURRENT_CANVAS_FIELD_WIDTH/2), Math.floor(CURRENT_CANVAS_FIELD_WIDTH/2), 0, canvas.width));
    var scaledMouseYOnCanvas = Math.round(Utils.mapValue(mouseYOnCanvas, -Math.floor(CURRENT_CANVAS_FIELD_HEIGHT/2), Math.floor(CURRENT_CANVAS_FIELD_HEIGHT/2), 0, canvas.height));

    return [scaledMouseXOnCanvas, scaledMouseYOnCanvas]
}

function viewportMouseToCanvasCoordinates(canvas, xPos, yPos)
{
    var boundingRect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / boundingRect.width;    
    var scaleY = canvas.height / boundingRect.height;  
    return [(xPos - boundingRect.left) * scaleX, (yPos - boundingRect.top) * scaleY];
}

function drawTargetOnField(canvas, xPos, yPos, targetColor)
{
    //console.log("Draw target: ("+xPos+", "+yPos+")")
    var ctx = canvas.getContext('2d');
    
    drawCircle(ctx, xPos, yPos, FieldDimensions.TARGET_RADIUS, canvasBackgroundColor, targetColor, 
               mapValueToCurrentCanvas(mapValueToCurrentField(40)) );
    drawLine(ctx, xPos, yPos+FieldDimensions.TARGET_RADIUS*3/2, xPos, yPos-FieldDimensions.TARGET_RADIUS*3/2, targetColor,
             mapValueToCurrentCanvas(mapValueToCurrentField(40)) )
    drawLine(ctx, xPos+FieldDimensions.TARGET_RADIUS*3/2, yPos, xPos-FieldDimensions.TARGET_RADIUS*3/2, yPos, targetColor, 
             mapValueToCurrentCanvas(mapValueToCurrentField(40)) )
}

function drawTargetPreviewOnField(canvas, debugInfo=false, scaledTargetPos = undefined, targetColor = "#FFFFFF")
{
    if(!mouseOverCanvas) return
    var unscaledTarget;
    var scaledTarget;
    if(scaledTargetPos == undefined)
    {
        unscaledTarget = canvas.unscaledMousePositionOnCanvas;
        scaledTarget = canvas.scaledMousePositionOnCanvas;    
    }
    else
    {
        x-special/nautilus-clipboard
copy
file:///home/asc/Downloads/Emanuele%20Musumeci%20(1653885)%20-%20Report.pdf

        unscaledTarget = scaleFieldPositionToCanvas(canvas, scaledTargetPos[0], scaledTargetPos[1])
        scaledTarget = scaledTargetPos;
    }

    if(debugInfo)
    {
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = canvasTextColor;
        ctx.font = mapValueToCurrentCanvas(mapValueToCurrentField(180))+"px Arial";
        ctx.fillText("X: "+scaledTarget[0]+", Y: "+-scaledTarget[1], 
                    mapValueToCurrentCanvas(mapValueToCurrentField(280)),
                    mapValueToCurrentCanvas(mapValueToCurrentField(300)) );
    }

    console.log("Drawing target preview: "+unscaledTarget)
    drawTargetOnField(canvas, unscaledTarget[0], unscaledTarget[1], targetColor)
}

function drawRobot(ctx, robotNumber, angle, xPos, yPos, isActiveRobot = false)
{
    var fillColor = "#AAAAAA";
    var lineColor = "#000000";

    if(isActiveRobot)
    {
        fillColor = "#00FF00";
        lineColor = "#0000FF";
    }
    drawCircle(ctx, xPos, yPos, FieldDimensions.ROBOT_RADIUS, fillColor, lineColor, 
                mapValueToCurrentCanvas(mapValueToCurrentField(20)), //border width 
                [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
    drawArrow(ctx, xPos, yPos, xPos+FieldDimensions.ROBOT_RADIUS*2*Math.cos(angle), yPos-FieldDimensions.ROBOT_RADIUS*2*Math.sin(angle), lineColor, 
                mapValueToCurrentCanvas(mapValueToCurrentField(20)), //border width 
                mapValueToCurrentCanvas(mapValueToCurrentField(50)), //arrow head length
                [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2]);
    
    drawTextLabel(ctx, 
                    xPos + FieldDimensions.ROBOT_RADIUS * 2, 
                    yPos - FieldDimensions.ROBOT_RADIUS * 1.5, "Robot "+ACTIVE_ROBOT_NUMBER, "#0000FF", 95,
                    [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2])
}

function drawBall(ctx)
{
    drawCircle(ctx, 
            mapValueToCurrentCanvas(mapValueToCurrentField(ballPosition[0])), 
            mapValueToCurrentCanvas(mapValueToCurrentField(ballPosition[1])), 
            FieldDimensions.BALL_RADIUS, "#FFFFFF", "#000000", 
            mapValueToCurrentCanvas(mapValueToCurrentField(20)), 
            [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2])
            
    drawTextLabel(ctx, 
        mapValueToCurrentCanvas(mapValueToCurrentField(ballPosition[0])) + FieldDimensions.BALL_RADIUS * 2, 
        mapValueToCurrentCanvas(mapValueToCurrentField(ballPosition[1])) + FieldDimensions.BALL_RADIUS * 2, "Ball", "#444444", 95,
        [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2])
};

function drawObstacles(ctx)
{
    console.log("START")
    for(var obs of obstaclesPositions)
    {
        drawCircle(ctx, 
                mapValueToCurrentCanvas(mapValueToCurrentField(obs[0])), 
                mapValueToCurrentCanvas(mapValueToCurrentField(obs[1])), 
                FieldDimensions.ROBOT_RADIUS, "#FF0000", "#000000", 
                mapValueToCurrentCanvas(mapValueToCurrentField(20)), 
                [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2])
                
        drawTextLabel(ctx, 
            mapValueToCurrentCanvas(mapValueToCurrentField(obs[0])) + FieldDimensions.ROBOT_RADIUS * 2, 
            mapValueToCurrentCanvas(mapValueToCurrentField(obs[1])) + FieldDimensions.ROBOT_RADIUS * 2, "Obstacle", "#FF0000", 95,
            [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2])
    }
}

function drawObjects(canvas)
{
    var ctx = canvas.getContext("2d")
    
    //Draw the ball
    drawBall(ctx)
    //Draw the active robots
    for( const [robotNumber, robotPosition] of Object.entries(robotNumbersToPositions)) 
    {
        drawRobot(ctx, robotNumber, 
                    robotPosition[0], 
                    Utils.mapValue(robotPosition[1], -CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_WIDTH/2, -CURRENT_CANVAS_FIELD_WIDTH/2, CURRENT_CANVAS_FIELD_WIDTH/2),
                    Utils.mapValue(robotPosition[2], -CANVAS_FIELD_HEIGHT/2, CANVAS_FIELD_HEIGHT/2, -CURRENT_CANVAS_FIELD_HEIGHT/2, CURRENT_CANVAS_FIELD_HEIGHT/2), 
                    robotNumber == ACTIVE_ROBOT_NUMBER)
    };

    //Draw the obstacles
    drawObstacles(ctx)
}

function drawCurrentTasks(canvas)
{
    if(robotNumbersToPositions[ACTIVE_ROBOT_NUMBER] == undefined) return;
    var prevWaypoint = scaleFieldPositionToCanvas(canvas, robotNumbersToPositions[ACTIVE_ROBOT_NUMBER][1], robotNumbersToPositions[ACTIVE_ROBOT_NUMBER][2]);
    for(var task of currentTaskList)
    {
        switch(task.taskType)
        {
            case "GoToPosition":
            {
                targetPosition = scaleFieldPositionToCanvas(canvas, task.parameters[0], -task.parameters[1]); 
                drawTargetOnField(canvas, targetPosition[0], targetPosition[1], taskColors[task.taskID])
                
                drawTextLabel(canvas.getContext("2d"), 
                                targetPosition[0] + FieldDimensions.ROBOT_RADIUS * 2, 
                                targetPosition[1] - FieldDimensions.ROBOT_RADIUS * 2, "Task "+task.taskID, taskColors[task.taskID], 95,
                                )

                drawLine(canvas.getContext("2d"), 
                            //Utils.mapValue(prevWaypoint[0], -CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_WIDTH/2, -CURRENT_CANVAS_FIELD_WIDTH/2, CURRENT_CANVAS_FIELD_WIDTH/2),
                            //Utils.mapValue(prevWaypoint[1], -CANVAS_FIELD_HEIGHT/2, CANVAS_FIELD_HEIGHT/2, -CURRENT_CANVAS_FIELD_HEIGHT/2, CURRENT_CANVAS_FIELD_HEIGHT/2),
                            prevWaypoint[0],
                            prevWaypoint[1],
                            targetPosition[0],
                            targetPosition[1],
                            "#0000CC",
                            20
                        )
                prevWaypoint = targetPosition;
                break;
            }
            case "KickBallToPosition":
            {
                targetPosition = scaleFieldPositionToCanvas(canvas, task.parameters[0], -task.parameters[1]); 
                drawTargetOnField(canvas, targetPosition[0], targetPosition[1], taskColors[task.taskID])

                drawArrow(canvas.getContext("2d"), 
                        Utils.mapValue(ballPosition[0], -CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_WIDTH/2, -CURRENT_CANVAS_FIELD_WIDTH/2, CURRENT_CANVAS_FIELD_WIDTH/2),
                        Utils.mapValue(ballPosition[1], -CANVAS_FIELD_HEIGHT/2, CANVAS_FIELD_HEIGHT/2, -CURRENT_CANVAS_FIELD_HEIGHT/2, CURRENT_CANVAS_FIELD_HEIGHT/2), 
                        targetPosition[0] - CANVAS_FIELD_WIDTH/2, 
                        targetPosition[1] - CANVAS_FIELD_HEIGHT/2, 
                        "#FF0000", 
                        mapValueToCurrentCanvas(mapValueToCurrentField(20)), //border width 
                        mapValueToCurrentCanvas(mapValueToCurrentField(200)), //arrow head length
                        [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2])

                drawTextLabel(canvas.getContext("2d"), 
                                targetPosition[0] + FieldDimensions.ROBOT_RADIUS * 2, 
                                targetPosition[1] - FieldDimensions.ROBOT_RADIUS * 2, "Task "+task.taskID, taskColors[task.taskID], 95,
                                )
                break;
            }
            case "CarryBallToPosition":
            {
                targetPosition = scaleFieldPositionToCanvas(canvas, task.parameters[0], -task.parameters[1]); 
                drawTargetOnField(canvas, targetPosition[0], targetPosition[1], taskColors[task.taskID])

                drawArrow(canvas.getContext("2d"), 
                        Utils.mapValue(ballPosition[0], -CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_WIDTH/2, -CURRENT_CANVAS_FIELD_WIDTH/2, CURRENT_CANVAS_FIELD_WIDTH/2),
                        Utils.mapValue(ballPosition[1], -CANVAS_FIELD_HEIGHT/2, CANVAS_FIELD_HEIGHT/2, -CURRENT_CANVAS_FIELD_HEIGHT/2, CURRENT_CANVAS_FIELD_HEIGHT/2), 
                        targetPosition[0] - CANVAS_FIELD_WIDTH/2, 
                        targetPosition[1] - CANVAS_FIELD_HEIGHT/2, 
                        "#FF0000", 
                        mapValueToCurrentCanvas(mapValueToCurrentField(20)), //border width 
                        mapValueToCurrentCanvas(mapValueToCurrentField(200)), //arrow head length
                        [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2])

                drawTextLabel(canvas.getContext("2d"), 
                                targetPosition[0] + FieldDimensions.ROBOT_RADIUS * 2, 
                                targetPosition[1] - FieldDimensions.ROBOT_RADIUS * 2, "Task "+task.taskID, taskColors[task.taskID], 95,
                                )
                break;
            }
            case "ScoreGoal":
            {   
                drawArrow(canvas.getContext("2d"), 
                        Utils.mapValue(ballPosition[0], -CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_WIDTH/2, -CURRENT_CANVAS_FIELD_WIDTH/2, CURRENT_CANVAS_FIELD_WIDTH/2),
                        Utils.mapValue(ballPosition[1], -CANVAS_FIELD_HEIGHT/2, CANVAS_FIELD_HEIGHT/2, -CURRENT_CANVAS_FIELD_HEIGHT/2, CURRENT_CANVAS_FIELD_HEIGHT/2), 
                        FieldDimensions.X_POS_SIDE_LINE, 
                        0, 
                        "#FF0000", 
                        mapValueToCurrentCanvas(mapValueToCurrentField(20)), //border width 
                        mapValueToCurrentCanvas(mapValueToCurrentField(50)), //arrow head length
                        [CANVAS_FIELD_WIDTH/2, CANVAS_FIELD_HEIGHT/2])
                break;
            }
        }
    }
}

function drawCanvas()
{
    var canvas = document.getElementById("field-canvas");
    //Draw the static field
    //console.log("drawField")
    drawField(canvas, canvas.height, canvas.height);
    
    
    //console.log("drawTarget")
    //Draw the target for the currently selected task button (if there is one)
    if(canvas.currentlySelectedTaskButton != undefined && canvas.currentlySelectedTaskButton.selectionMode != "noSelection")
        drawTargetPreviewOnField(canvas, true)    
    
    //Draw something for each task (a target and or other info)
    drawCurrentTasks(canvas);
    
    //console.log("drawObjects")
    //Draw the ball, the robot positions and the obstacle positions
    drawObjects(canvas)
}


function startRenderingLoop()
{
    if(!CLIENT_ENABLED) return;

    console.log("START RENDER")
    var lastRender = 0
    
    function renderingLoop(timestamp)
    {
        if(!CLIENT_ENABLED) return
        
        
        drawCanvas()
        
        lastRender = timestamp
        
        window.requestAnimationFrame(renderingLoop)
    }

    window.requestAnimationFrame(renderingLoop)
}

function sendNewTask(selectedRobot, taskType, selectionMode, xPos=undefined, yPos=undefined)
{
    if(selectionMode === "noSelection")
    {
        sendToWebSocket("taskType:"+selectedRobot+","+selectionMode+","+taskType+","+(lastReceivedTaskID+1));
    }
    else
    {
        sendToWebSocket("taskType:"+selectedRobot+","+selectionMode+","+taskType+","+(lastReceivedTaskID+1)+","+xPos+","+-yPos);
    }
}



//--------------
//| WEBSOCKET  |
//--------------


//Taken from https://www.codegrepper.com/code-examples/javascript/javascript+generate+unique+hash
var CLIENT_ID = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
});

function generateHeader()
{
    return "TOSERVER!clientID,"+CLIENT_ID+";robotNumber,"+ACTIVE_ROBOT_NUMBER+"|";
}

function sendToWebSocket(message)
{
    console.log(webSocket.readyState)
    if(webSocket.readyState === WebSocket.OPEN)
    {
        console.log("Sending message: "+message)
        webSocket.send(generateHeader() + message);
    }
}

function disableClient(reason)
{
    CLIENT_ENABLED = false;
    clearInterval(keepalive_send_timeout);
    clearInterval(keepalive_receive_timeout);
    console.log("Disabling client (reason: "+reason+")")

    document.getElementById("body").style.visibility = "hidden";
    document.getElementById("simple-tasks-tab").innerHTML = "";
    document.getElementById("complex-tasks-tab").innerHTML = "";
    currentTaskList = [];
    currentSocket = undefined;

    /*if(!CLIENT_ENABLED) 
    {
        var webSocket = new WebSocket("ws://localhost:4000");
        setupSocket(webSocket)
        waitForWebSocketConnection(webSocket);
    }*/
}

function sendTask(taskType, robotNumber) {}

function toggleTaskButtonSelection(button) {

    var canvas = document.getElementById("field-canvas");
    if(canvas.currentlySelectedTaskButton == button)
    {
        canvas.currentlySelectedTaskButton = undefined;
        console.log("Task button "+button.id+" unselected")
    }
    else 
    {
        canvas.currentlySelectedTaskButton = button;
        console.log("Task button "+button.id+" selected with mode "+document.getElementById("field-canvas").currentlySelectedTaskButton.selectionMode);
    }
}

function createTaskAssignmentButton(tab, taskLabel, taskType, selectionMode) {

    var outerDiv = document.createElement("DIV");
    outerDiv.classList.add("settings-horizontal-container")
    outerDiv.style.height = "18%";

    var middleDiv = document.createElement("DIV");  
    middleDiv.classList.add("settings-horizontal-container")  
    middleDiv.style.height = "80%";
    outerDiv.appendChild(middleDiv);
    
    var innerDiv = document.createElement("DIV");   
    innerDiv.classList.add("settings-horizontal-container")        
    innerDiv.style.height = "100%";     
    innerDiv.style.justifyContent = "space-around"; 
    middleDiv.appendChild(innerDiv);
              

    var btn = document.createElement("BUTTON");
    btn.classList.add("settings-horizontal-container")
    btn.innerHTML = taskLabel;
    btn.taskType = taskType;
    btn.selectionMode = selectionMode;

    btn.onmousedown = function(e){
        var canvas = document.getElementById("field-canvas");
        
        //Unselect the other selected task button if there is one
        if(canvas.currentlySelectedTaskButton != undefined)
        {
            toggleButton(canvas.currentlySelectedTaskButton)
            toggleTaskButtonSelection(canvas.currentlySelectedTaskButton);
        }

        if(selectionMode === "noSelection")
        {
            //Highlight the button for 0.2 seconds after press to give visual feedback for the button press
            toggleButton(e.target)
            setTimeout(function () {toggleButton(e.target)}, 200)

            sendNewTask(ACTIVE_ROBOT_NUMBER, btn.taskType, "noSelection");         
        }
        else
        {
            toggleButton(e.target);
            toggleTaskButtonSelection(e.target);
        }
    };

    btn.ontouchstart = function(e){
        var canvas = document.getElementById("field-canvas");
        
        //Unselect the other selected task button if there is one
        if(canvas.currentlySelectedTaskButton != undefined)
        {
            toggleButton(canvas.currentlySelectedTaskButton)
            toggleTaskButtonSelection(canvas.currentlySelectedTaskButton);
        }

        if(selectionMode === "noSelection")
        {
            //Highlight the button for 0.2 seconds after press to give visual feedback for the button press
            toggleButton(e.changedTouches[0].target)
            setTimeout(function () {toggleButton(e.changedTouches[0].target)}, 200)

            sendNewTask(ACTIVE_ROBOT_NUMBER, btn.taskType, "noSelection");         
        }
        else
        {
            toggleButton(e.changedTouches[0].target);
            toggleTaskButtonSelection(e.changedTouches[0].target);
        }
    };

    innerDiv.appendChild(btn);               // Append the button to the inner DIV as a child

    var tasksTab = document.getElementById(tab);
    tasksTab.appendChild(outerDiv);               // Append the outerDiv to the settings tab as a child

}

function scheduleTaskReset()
{
    sendToWebSocket("resetTasks,"+ACTIVE_ROBOT_NUMBER);
}

function scheduleDeleteTask(taskID)
{
    sendToWebSocket("deleteTask,"+ACTIVE_ROBOT_NUMBER+","+taskID);
}

function createResetTasksButton(tab) {

    var outerDiv = document.createElement("DIV");
    outerDiv.classList.add("settings-horizontal-container")
    outerDiv.style.height = "18%";

    var middleDiv = document.createElement("DIV");  
    middleDiv.classList.add("settings-horizontal-container")  
    middleDiv.style.height = "80%";
    outerDiv.appendChild(middleDiv);
    
    var innerDiv = document.createElement("DIV");   
    innerDiv.classList.add("settings-horizontal-container")        
    innerDiv.style.height = "100%";     
    innerDiv.style.justifyContent = "space-around"; 
    middleDiv.appendChild(innerDiv);
              

    var btn = document.createElement("BUTTON");
    btn.classList.add("settings-horizontal-container")
    btn.id = "resetTasksButton"
    btn.innerHTML = "Reset tasks";

    btn.onmousedown = function(e){
        var canvas = document.getElementById("field-canvas");

        //Unselect the selected task button if there is one
        if(canvas.currentlySelectedTaskButton != undefined)
        {
            toggleButton(canvas.currentlySelectedTaskButton);
            toggleTaskButtonSelection(canvas.currentlySelectedTaskButton);
        }

        //Highlight the button for 1 seconds after press to give visual feedback for the button press
        var oldColor = e.target.style.backgroundColor;
        e.target.style.backgroundColor = "#000000";
        setTimeout(function () {e.target.style.backgroundColor = oldColor}, 200)

        scheduleTaskReset();
    };

    btn.ontouchstart = function(e){
        var canvas = document.getElementById("field-canvas");

        //Unselect the selected task button if there is one
        if(canvas.currentlySelectedTaskButton != undefined)
        {
            toggleButton(canvas.currentlySelectedTaskButton);
            toggleTaskButtonSelection(canvas.currentlySelectedTaskButton);
        }

        //Highlight the button for 1 seconds after press to give visual feedback for the button press
        toggleButton(e.changedTouches[0].target)
        setTimeout(function () {toggleButton(e.changedTouches[0].target)}, 200)

        scheduleTaskReset();
    };

    innerDiv.appendChild(btn);               // Append the button to the inner DIV as a child

    var tasksTab = document.getElementById(tab);
    tasksTab.appendChild(outerDiv);               // Append the outerDiv to the settings tab as a child
}

function createTellInstructionsButton(tab) {

    var outerDiv = document.createElement("DIV");
    outerDiv.classList.add("settings-horizontal-container")
    outerDiv.style.height = "18%";

    var middleDiv = document.createElement("DIV");  
    middleDiv.classList.add("settings-horizontal-container")  
    middleDiv.style.height = "80%";
    outerDiv.appendChild(middleDiv);
    
    var innerDiv = document.createElement("DIV");   
    innerDiv.classList.add("settings-horizontal-container")        
    innerDiv.style.height = "100%";     
    innerDiv.style.justifyContent = "space-around"; 
    middleDiv.appendChild(innerDiv);
                

    var btn = document.createElement("BUTTON");
    btn.classList.add("settings-horizontal-container")
    btn.innerHTML = "Tell instructions";
    btn.taskType = "InstructionsSpeech";
    btn.selectionMode = "noSelection";
    btn.id = "tellInstructionsButton"

    btn.onmousedown = function(e){
        var canvas = document.getElementById("field-canvas");
        
        //Unselect the other selected task button if there is one
        if(canvas.currentlySelectedTaskButton != undefined)
        {
            toggleButton(canvas.currentlySelectedTaskButton)
            toggleTaskButtonSelection(canvas.currentlySelectedTaskButton);
        }

        //Highlight the button for 0.2 seconds after press to give visual feedback for the button press
        var oldColor = e.target.style.backgroundColor;
        e.target.style.backgroundColor = "#000000";
        setTimeout(function () {e.target.style.backgroundColor = oldColor}, 200)

        sendNewTask(ACTIVE_ROBOT_NUMBER, btn.taskType, "noSelection");       
    };

    btn.ontouchstart = function(e){
        var canvas = document.getElementById("field-canvas");
        
        //Unselect the other selected task button if there is one
        if(canvas.currentlySelectedTaskButton != undefined)
        {
            toggleButton(canvas.currentlySelectedTaskButton)
            toggleTaskButtonSelection(canvas.currentlySelectedTaskButton);
        }

        //Highlight the button for 0.2 seconds after press to give visual feedback for the button press
        toggleButton(e.changedTouches[0].target)
        setTimeout(function () {toggleButton(e.changedTouches[0].target)}, 200)

        sendNewTask(ACTIVE_ROBOT_NUMBER, btn.taskType, "noSelection");       
    };

    innerDiv.appendChild(btn);               // Append the button to the inner DIV as a child

    var tasksTab = document.getElementById(tab);
    tasksTab.appendChild(outerDiv);               // Append the outerDiv to the settings tab as a child

}


function createTaskPreview(taskLabel, taskID, position=undefined) {

    var div = document.createElement("DIV");
    div.classList.add("taskPreview");
    div.id = "task-"+taskID;
    div.taskID = taskID

    div.innerHTML = "("+taskID+") "+taskLabel
    div.style.backgroundColor = taskColors[taskID];

    if(position!=undefined) div.innerHTML+="\n("+position[0]+", "+position[1]+")";

    div.onmousedown = function(e){
        
        console.log("Task deletion scheduled for taskID: "+taskID)
        var oldColor = e.target.style.backgroundColor;
        e.target.style.backgroundColor = "#000000";
        setTimeout(function () {e.target.style.backgroundColor = oldColor}, 200)
        scheduleDeleteTask(taskID);
    };

    div.ontouchstart = function(e){
        
        console.log("Task deletion scheduled for taskID: "+taskID)
        scheduleDeleteTask(taskID);
    };

    var tasksPreview = document.getElementById("tasks-preview");
    tasksPreview.appendChild(div);               // Append the outerDiv to the settings tab as a child
    currentTaskPreviews.push(div)
}

function updateTaskPreviews(lastCompletedTaskID)
{
    var tasksPreviewDiv = document.getElementById("tasks-preview");
    tasksPreviewDiv.innerHTML = ""

    console.log(currentTaskPreviews)
    for(var taskPreview of currentTaskPreviews)
    {
        if(taskPreview.taskID > lastCompletedTaskID)
        {  
            tasksPreviewDiv.appendChild(taskPreview)
        }
    }
}

function enableClient()
{
    CLIENT_ENABLED = true;
    //The following initialization steps follow the numbering on the report
    document.getElementById("body").style.visibility = "visible";
    /*
    1) Canvas initialization
    */
    var canvasContainer = document.getElementById( "canvas-container" );
    canvasContainer.style.backgroundColor = canvasContainerBackgroundColor
    canvas = document.getElementById( "field-canvas" );
    canvas.width = CANVAS_FIELD_WIDTH;
    canvas.height = CANVAS_FIELD_HEIGHT;
    canvas.unscaledMousePositionOnCanvas = [canvas.width/2, canvas.height/2];
    canvas.scaledMousePositionOnCanvas = [canvas.width/2, canvas.height/2];

    canvas.addEventListener("mousemove", function(evt) 
    {   
        mouseOverCanvas = true;
        evt.target.unscaledMousePositionOnCanvas = viewportMouseToCanvasCoordinates(evt.target, evt.clientX, evt.clientY);
        evt.target.scaledMousePositionOnCanvas = scaleMousePositionToField(evt.target, evt.clientX, evt.clientY)
    });

    canvas.addEventListener("mouseleave", function(evt) 
    {   
        mouseOverCanvas = false;
    });

    
    canvas.addEventListener("mousedown", function(evt) 
    {   
        console.log("click")
        var clickPos = scaleMousePositionToField(evt.target, evt.clientX, evt.clientY);
        if(evt.target.currentlySelectedTaskButton != undefined)
        {
            
            //Utils.assert(evt.target.ACTIVE_ROBOT_NUMBER != undefined, "Inconsistent situation: not having a robot selected should make the task buttons unclickable");
            
            sendNewTask(ACTIVE_ROBOT_NUMBER, evt.target.currentlySelectedTaskButton.taskType, evt.target.currentlySelectedTaskButton.selectionMode, clickPos[0], clickPos[1]);         
            toggleButton(evt.target.currentlySelectedTaskButton);
            evt.target.currentlySelectedTaskButton = undefined;
        }
    });



    canvas.addEventListener("touchmove", function(evt) 
    {   
        mouseOverCanvas = true;
        document.getElementById("field-canvas").unscaledMousePositionOnCanvas = viewportMouseToCanvasCoordinates(document.getElementById("field-canvas"), evt.changedTouches[0].pageX, evt.changedTouches[0].pageY);
        document.getElementById("field-canvas").scaledMousePositionOnCanvas = scaleMousePositionToField(document.getElementById("field-canvas"), evt.changedTouches[0].pageX, evt.changedTouches[0].pageY)
    });


    canvas.addEventListener("touchend", function(evt) 
    {   
        console.log("click")
        var clickPos = scaleMousePositionToField(document.getElementById("field-canvas"), evt.changedTouches[0].pageX, evt.changedTouches[0].pageY);
        if(document.getElementById("field-canvas").currentlySelectedTaskButton != undefined)
        {
            
            //Utils.assert(evt.changedTouches[0].target.ACTIVE_ROBOT_NUMBER != undefined, "Inconsistent situation: not having a robot selected should make the task buttons unclickable");
            
            sendNewTask(ACTIVE_ROBOT_NUMBER, document.getElementById("field-canvas").currentlySelectedTaskButton.taskType, document.getElementById("field-canvas").currentlySelectedTaskButton.selectionMode, clickPos[0], clickPos[1]);         
            toggleButton(document.getElementById("field-canvas").currentlySelectedTaskButton);
            document.getElementById("field-canvas").currentlySelectedTaskButton = undefined;
        }
        mouseOverCanvas = false;
    });

    canvas.currentlySelectedTaskButton = undefined;

    createTaskAssignmentButton("simple-tasks-tab", "Go to position", "GoToPosition", "singlePosition")
    createTaskAssignmentButton("simple-tasks-tab", "Kick to position", "KickBallToPosition", "singlePosition")
    createTaskAssignmentButton("simple-tasks-tab", "Carry ball to position", "CarryBallToPosition", "singlePosition")
    createResetTasksButton("simple-tasks-tab", );
    createTellInstructionsButton("simple-tasks-tab", );

    createTaskAssignmentButton("complex-tasks-tab", "Score a goal", "ScoreGoalTask", "noSelection")
    //createTaskAssignmentButton("complex-tasks-tab", "Defend field", "DefendFieldTask", "noSelection")
    createResetTasksButton("complex-tasks-tab", );
    createTellInstructionsButton("complex-tasks-tab", );

}

var KEEPALIVE_SEND_INTERVAL = 5000;
var KEEPALIVE_RECEIVE_INTERVAL = 5000;
var CLIENT_INFO_INTERVAL = 1000;
var RETRY_CONNECTION_TIMEOUT = 2000;

var currentSocket;

var keepalive_receive_timeout;
var keepalive_send_timeout;

function checkSocketStillOpen()
{
    if(currentSocket == undefined || currentSocket.readyState == WebSocket.CLOSED || currentSocket.readyState == WebSocket.CLOSING)
    {
        return false;
    }
    return true;
}

function requestKeepalive() {
    
    if(!CLIENT_ENABLED)
    {
        clearInterval(keepalive_send_timeout);
        clearInterval(keepalive_receive_timeout);
    }

    if(!checkSocketStillOpen())
    {
        disableClient("Socket CLOSED");
        return;
    }

    //console.log("Requesting keepalive")
    currentSocket.send(generateHeader() + 'uthere?');

    //Set a timeout to be cleared in case a keepalive is received
    keepalive_receive_timeout = setTimeout(function () {
        //If this is executed, the server failed to respond to the keepalive
        disableClient("Keepalive not received");
    }, KEEPALIVE_RECEIVE_INTERVAL);
}

function sendClientInfo()
{
    currentSocket.send(generateHeader())
}

function setupSocket(webSocket)
{
    webSocket.onopen = function () {
        // connection is opened and ready to use
        
        currentSocket = webSocket;

        //console.log("WebSocket connected to NodeJS server")
        //console.log(webSocket)
        sendClientInfo(webSocket);

        //Start rendering the canvas
        enableClient();

        //Set up a ping pong method for keepalive
        //console.log("Setting up keepalive")
        keepalive_send_timeout = setInterval(requestKeepalive, KEEPALIVE_SEND_INTERVAL);

        startRenderingLoop();
    };

    webSocket.onerror = function (error) {
        // an error occurred when sending/receiving data
    };

    function resetTaskList()
    {
        currentTaskList = [];
        currentTaskPreviews = [];
        document.getElementById("tasks-preview").innerHTML = ""
    }


    function addTask(taskType, taskID, parameters = undefined)
    {
        createTaskPreview(taskType, taskID, parameters)
        if(parameters == undefined)
        {
            currentTaskList.push({taskType : taskType, taskID : taskID})
        }
        else
        {
            currentTaskList.push({taskType : taskType, taskID : taskID, parameters : parameters})
        }
    }

    webSocket.onmessage = function (message) {
        // handle incoming message
        //console.log(message)
        //Avoid reading your own messages
        if(message.data.startsWith("TOSERVER")) return;
        
        var message_content = message.data.toString().split("!")[1]
        //console.log(message_content)

        if(message_content == 'yeah')
        {
            //Keepalive received, stop waiting
            //console.log("Keepalive received!")
            clearTimeout(keepalive_receive_timeout);
        }
        else if(message_content.startsWith('robotNotResponding'))
        {
            console.log("Robot not responding. Disabling client!")
            disableClient("Robot not responding")
        }
        else
        {
            if(!CLIENT_ENABLED)
            {
                enableClient()
                startRenderingLoop()
            }

            if(message_content.startsWith("robotPosition"))
            {
                message_content = message_content.split(":")[1]
                var message_fields = message_content.split(",")
                var robotNumber = message_fields[0]

                //NOTICE: the y coordinate is inverted
                robotNumbersToPositions[robotNumber] = [
                    parseFloat(message_fields[1]), 
                    Math.floor(parseFloat(message_fields[2])), 
                    -Math.floor(parseFloat(message_fields[3]))
                ];
            }
            else if(message_content.startsWith("ballPosition"))
            {
                message_content = message_content.split(":")[1]
                var message_fields = message_content.split(",")

                //NOTICE: the y coordinate is inverted
                ballPosition = [Math.floor(parseFloat(message_fields[0])), -Math.floor(parseFloat(message_fields[1]))]
            }
            else if(message_content.startsWith("obstacles"))
            {
                var message_fields = message_content.split(":")[1].split(";")
                obstaclesPositions = []
                for(var field of message_fields)
                {
                    var obsCoords = field.split(",")
                    
                    //NOTICE: the y coordinate is inverted
                    obstaclesPositions.push([Math.floor(parseFloat(obsCoords[0])), -Math.floor(parseFloat(obsCoords[1]))])
                }              
            }
            else if(message_content.startsWith("taskQueue"))
            {
                resetTaskList();
                
                message_content = message_content.replace(/\0.*$/g,'');

                console.log(message_content)
                var content_fields = message_content.split(";").slice(1)
                
                console.log(content_fields)
                lastReceivedTaskID = parseInt(content_fields[0].split(",")[1])
                lastCompletedTaskID = parseInt(content_fields[0].split(",")[2])
                //console.log(lastReceivedTaskID)
                //console.log(lastCompletedTaskID)
                
                //If there isn't any task return
                if(content_fields.length == 1) return;
        
                //console.log(content_fields)
                for(var task of content_fields.slice(1))
                {
                    var task_fields = task.split(",")
                    
                    var taskType = task_fields[0]
                    var taskID = parseInt(task_fields[1])
        
                    if(task_fields.length==2)
                    {
                        addTask(taskType, taskID)
                    }
                    else if(task_fields.length==4)
                    {
                        var xPos = Math.floor(parseFloat(task_fields[2]))
                        var yPos = Math.floor(parseFloat(task_fields[3]))
                        addTask(taskType, taskID, [xPos, yPos])
                    }
                    else
                    {
                        console.log("Wrong taskQueue format")
                        console.log(message_content)
                        return;
                    }
                }
            }
        }
    };
}

//Taken from https://stackoverflow.com/questions/13546424/how-to-wait-for-a-websockets-readystate-to-change
function waitForWebSocketConnection(webSocket)
{
    setTimeout(
        function () {
            if (webSocket.readyState == WebSocket.OPEN) {
            } else {
                console.log("Attempting connection of websocket...")
                webSocket = new WebSocket("ws://"+SERVER_IP+":4000");
                setupSocket(webSocket)
                waitForWebSocketConnection(webSocket);
            }

        }, RETRY_CONNECTION_TIMEOUT); // wait 5 milisecond for the connection...
}


var CLIENT_ENABLED = true;
disableClient("Waiting for socket connection");
var webSocket = new WebSocket("ws://localhost:4000");
setupSocket(webSocket)
waitForWebSocketConnection(webSocket);

