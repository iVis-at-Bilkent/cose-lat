var graph = {};
var edgeNodes = [];
var setFileContent = function(fileName){
    var span = document.getElementById('file-input');
    while( span.firstChild ) {
        span.removeChild( span.firstChild );
    }
    span.appendChild( document.createTextNode(fileName) );
};
$(function () {
    loadCanvas();
    var xmlObject = loadXMLDoc("samples/graph0.xml");
    var graphmlConverter = graphmlToJSON(xmlObject);
    atts = graphmlConverter.attributes;

    var cytoscapeJsGraph = {
        edges: graphmlConverter.objects[2],
        nodes: graphmlConverter.objects[1],
    };
    refreshCytoscape(cytoscapeJsGraph);
    setFileContent("graph0.graphml");
    var naviOptions = {
        container: $("#navigator")
    };
    cy.navigator(naviOptions); 
    screenNodeDetail();
//    var panProps = ({
//        zoomFactor: 0.05, // zoom factor per zoom tick
//        zoomDelay: 45, // how many ms between zoom ticks
//        minZoom: 0.1, // min zoom level
//        maxZoom: 10, // max zoom level
//        fitPadding: 50, // padding when fitting
//        panSpeed: 10, // how many ms in between pan ticks
//        panDistance: 10, // max pan distance per tick
//        panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
//        panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
//        panInactiveArea: 3, // radius of inactive area in pan drag box
//        panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
//        autodisableForMobile: true, // disable the panzoom completely for mobile (since we don't really need it with gestures like pinch to zoom)
//
//        // icon class names
//        sliderHandleIcon: 'fa fa-minus',
//        zoomInIcon: 'fa fa-plus',
//        zoomOutIcon: 'fa fa-minus',
//        resetIcon: 'fa fa-expand'    });
//    cy.panzoom(panProps);
    editForces();
});
$("#cose-bilkent").css("background-color", "grey");

function refreshCytoscape(graphData) { // on dom ready
    cy = cytoscape({
        container: $('#cy')[0],
        style: [
            {
                selector: 'node',
                style: {
                    'content': 'data(name)',
                    'background-color': '#aaa',
                    'border-width': 1,
                    'border-color': 'black',
                    'text-valign': 'center',
                    'color': 'white',
                    'text-outline-width': 2,
                    'text-outline-color': '#888',
                    'shape': 'rectangle'
                }
            },
            {
                selector: 'node:selected',
                style: {
                    'background-color': 'black',
                    'line-color': 'black',
                    'target-arrow-color': 'black',
                    'source-arrow-color': 'black',
                    'text-outline-color': 'black',
                    'border-color': 'black',
                    'border-width': 5
                }
            },
            {
                selector: ':parent',
                style: {
                    'background-opacity': 0.333,
                    'text-valign': "bottom"
                }
            },
            {
                selector: 'edge',
                style: {
                    'background-color': 'black',
                    'line-color': 'black',
                    'target-arrow-color': 'red',
                    'source-arrow-color': 'black',
                    'text-outline-color': 'black',
                    'curve-style': "bezier"
                }
            },
            {
                selector: 'edge:selected',
                style: {
                    'background-color': 'black',
                    'line-color': 'black',
                    'width': 5,
                    'opacity':1,
                    'color' : 'black'
                }
            },
        ],

        elements: {
            nodes: graphData['nodes'],
            edges: graphData['edges']

        },
        layout: {
            name: 'preset',
            fit: true
        },
        boxSelectionEnabled: true,
        motionBlur: true,
        wheelSensitivity: 0.1,
        ready: function(){
            var i = 0;
            this.on('tap', 'node', function(evt){
                if (i < 2){
                    edgeNodes[i++] = this._private.data.id;
                }
                else{
                    edgeNodes = [];
                    i = 0;
                }
            });

            var getNodesData = function () {
                var nodesData = {};
                var nodes = cy.nodes();
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    nodesData[node.id()] = {
                        width: node.width(),
                        height: node.height(),
                        x: node.position("x"),
                        y: node.position("y")
                    };
                }
                return nodesData;
            };

            var enableDragAndDropMode = function () {
                window.dragAndDropModeEnabled = true;
                $("#sbgn-network-container").addClass("target-cursor");
                cy.autolock(true);
                cy.autounselectify(true);
            };

            var disableDragAndDropMode = function () {
                window.dragAndDropModeEnabled = null;
                window.nodeToDragAndDrop = null;
                $("#sbgn-network-container").removeClass("target-cursor");
                cy.autolock(false);
                cy.autounselectify(false);
            };

            var lastMouseDownNodeInfo = null;
            this.on("mousedown", "node", function () {
                var self = this;
                lastMouseDownNodeInfo = {};
                lastMouseDownNodeInfo.lastMouseDownPosition = {
                    x: this.position("x"),
                    y: this.position("y")
                };
                lastMouseDownNodeInfo.node = this;
            });

            this.on("mouseup", "node", function () {
                if (lastMouseDownNodeInfo == null) {
                    return;
                }
                var node = lastMouseDownNodeInfo.node;
                var lastMouseDownPosition = lastMouseDownNodeInfo.lastMouseDownPosition;
                var mouseUpPosition = {
                    x: node.position("x"),
                    y: node.position("y")
                };
                if (mouseUpPosition.x != lastMouseDownPosition.x ||
                    mouseUpPosition.y != lastMouseDownPosition.y) {
                    var positionDiff = {
                        x: mouseUpPosition.x - lastMouseDownPosition.x,
                        y: mouseUpPosition.y - lastMouseDownPosition.y
                    };

                    var nodes;
                    if (node.selected()) {
                        nodes = cy.nodes(":visible").filter(":selected");
                    }
                    else {
                        nodes = [];
                        nodes.push(node);
                    }

                    var param = {
                        positionDiff: positionDiff,
                        nodes: nodes, move: false
                    };
                    editorActionsManager._do(new MoveNodeCommand(param));

                    lastMouseDownNodeInfo = null;
                    refreshUndoRedoButtonsStatus();
                }
            });
        }
    });
    var panProps = ({
        zoomFactor: 0.05, // zoom factor per zoom tick
        zoomDelay: 45, // how many ms between zoom ticks
        minZoom: 0.1, // min zoom level
        maxZoom: 10, // max zoom level
        fitPadding: 50, // padding when fitting
        panSpeed: 10, // how many ms in between pan ticks
        panDistance: 10, // max pan distance per tick
        panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
        panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
        panInactiveArea: 8, // radius of inactive area in pan drag box
        panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
        autodisableForMobile: true, // disable the panzoom completely for mobile (since we don't really need it with gestures like pinch to zoom)

        // icon class names
        sliderHandleIcon: 'fa fa-minus',
        zoomInIcon: 'fa fa-plus',
        zoomOutIcon: 'fa fa-minus',
        resetIcon: 'fa fa-expand'    });
    cy.panzoom(panProps);
    
    ur = cy.undoRedo({

    });

    cy.on("undo", function (e, name) {
        refreshUndoRedoButtonsStatus();
    });
    cy.on("redo", function (e, name) {
        refreshUndoRedoButtonsStatus();
    });
    cy.on("do", function (e, name) {
        refreshUndoRedoButtonsStatus();
    });

    ur.action("addNode", addNode, removeNodes);
    ur.action("createCompound", createCompoundForSelectedNodes, removeCompound);
}
;


var COSEBilkentLayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: 'cose-bilkent',
        ready: function () {
        },
        // Called on `layoutstop`
        stop: function () {
        },
        // Number of iterations between consecutive screen positions update (0 -> only updated on the end)
        refresh: 0,
        // Whether to fit the network view after when done
        fit: true,
        // Padding on fit
        padding: 10,
        // Whether to enable incremental mode
        incremental: true,
        // Whether to use the JS console to print debug messages
        debug: true,
        // Node repulsion (non overlapping) multiplier
        nodeRepulsion: 4500,
        // Node repulsion (overlapping) multiplier
        nodeOverlap: 10,
        // Ideal edge (non nested) length
        idealEdgeLength: 50,
        // Divisor to compute edge forces
        edgeElasticity: 0.45,
        // Nesting factor (multiplier) to compute ideal edge length for nested edges
        nestingFactor: 0.1,
        // Gravity force (constant)
        gravity: 0.4,
        // Maximum number of iterations to perform
        numIter: 2500,
        // Initial temperature (maximum node displacement)
        initialTemp: 200,
        // Cooling factor (how the temperature is reduced between consecutive iterations
        coolingFactor: 0.95,
        // Lower temperature threshold (below this point the layout will end)
        minTemp: 1,
        // For enabling tiling
        tile: true,
        //whether to make animation while performing the layout
        animate: true
    },
    currentLayoutProperties: null,
    initialize: function () {
        var self = this;
        self.copyProperties();
        var temp = _.template($("#cose-bilkent-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
    },
    copyProperties: function () {
        this.currentLayoutProperties = _.clone(this.defaultLayoutProperties);
    },
    applyLayout: function () {
        animatedData = [];
        numberOfKeyframes = 0;
        var options = {};
        for (var prop in this.currentLayoutProperties) {
            options[prop] = this.currentLayoutProperties[prop];
        }
        cy.layout(options);
    },
    render: function () {
        var self = this;
        var temp = _.template($("#cose-bilkent-settings-template").html());
        self.template = temp(this.currentLayoutProperties);
        $(self.el).html(self.template);

        $(self.el).dialog();

        $("#save-layout4").click( function (evt) {
            self.currentLayoutProperties.nodeRepulsion = Number(document.getElementById("node-repulsion4").value);
            self.currentLayoutProperties.nodeOverlap = Number(document.getElementById("node-overlap4").value);
            self.currentLayoutProperties.idealEdgeLength = Number(document.getElementById("ideal-edge-length4").value);
            self.currentLayoutProperties.edgeElasticity = Number(document.getElementById("edge-elasticity4").value);
            self.currentLayoutProperties.nestingFactor = Number(document.getElementById("nesting-factor4").value);
            self.currentLayoutProperties.gravity = Number(document.getElementById("gravity4").value);
            self.currentLayoutProperties.numIter = Number(document.getElementById("num-iter4").value);
            self.currentLayoutProperties.animate = document.getElementById("animate4").checked;
            self.currentLayoutProperties.refresh = Number(document.getElementById("refresh4").value);
            self.currentLayoutProperties.fit = document.getElementById("fit4").checked;
            self.currentLayoutProperties.padding = Number(document.getElementById("padding4").value);
            self.currentLayoutProperties.debug = document.getElementById("debug4").checked;
            self.currentLayoutProperties.initialTemp = Number(document.getElementById("initialTemp4").value);
            self.currentLayoutProperties.minTemp = Number(document.getElementById("minTemp4").value);
            self.currentLayoutProperties.coolingFactor = Number(document.getElementById("coolingFactor4").value);
            self.currentLayoutProperties.incremental = document.getElementById("incremental4").checked;
            self.currentLayoutProperties.tile = document.getElementById("tile4").checked;


            $(self.el).dialog('close');

        });

        $("#default-layout4").click( function (evt) {
            self.copyProperties();
//            console.log("asd");
            var temp = _.template($("#cose-bilkent-settings-template").html());
            self.template = temp(self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;
    }
});

var whitenBackgrounds = function(){
    $("#cose-bilkent").css("background-color", "white");
/*    
    $("#cose").css("background-color", "white");
    $("#cola").css("background-color", "white");
    $("#springy").css("background-color", "white");
    $("#arbor").css("background-color", "white");
*/
};

var animatedData = [];
var numberOfKeyframes;
window.addEventListener('send', function (e) { 
    animatedData.push(e.detail);
}, false);

var screenNodes = function(keyframeNumber){
    var dataToScreen = animatedData[keyframeNumber];
    if (dataToScreen != null) {
        cy.nodes().positions(function (i, ele) {
          if (ele.data('dummy_parent_id')) {
            return {
              x: dataToScreen[ele.data('dummy_parent_id')].x,
              y: dataToScreen[ele.data('dummy_parent_id')].y
            };
          }
          var theId = ele.data('id');
          var pNode = dataToScreen[theId];
          var temp = this;
          while (pNode == null) {
            temp = temp.parent()[0];
            pNode = dataToScreen[temp.id()];
            dataToScreen[theId] = pNode;
          }
          return {
            x: pNode.x,
            y: pNode.y    
          };
        });
        var tempLayout = new COSEBilkentLayout();
        if (tempLayout.currentLayoutProperties.fit)
          cy.fit(cy.nodes(), tempLayout.currentLayoutProperties.padding);
  }
};
//
var screenForces = function(keyframeNumber){
    var dataToScreen = animatedData[keyframeNumber];
    if (dataToScreen != null) {
        cy.nodes().forEach(function( ele ){
//          if (ele.data('dummy_parent_id')) {
//            var positionX = dataToScreen[ele.data('dummy_parent_id')].x;
//            var positionY = dataToScreen[ele.data('dummy_parent_id')].y;
//            var springForceX = 2;
//            var springForceY = 4;
//            var repulsionForceX = -2;
//            var repulsionForceY = -6;
//            var gravityForceX = 5;
//            var gravityForceY = -4;
//            drawForce(positionX, positionY, springForceX, springForceY, 1);
//            drawForce(positionX, positionY, repulsionForceX, repulsionForceY, 2);
//            drawForce(positionX, positionY, gravityForceX, gravityForceY, 3);
//          }
//          else{
//            var theId = ele.data('id');
//            var pNode = dataToScreen[theId];
//            var temp = this;
//            while (pNode == null) {
//              temp = temp.parent()[0];
//              pNode = dataToScreen[temp.id()];
//              dataToScreen[theId] = pNode;
//            }

                var positionX = ele.renderedPosition('x');
                var positionY = ele.renderedPosition('y');
                var springForceX = 35;
                var springForceY = 40;
                var repulsionForceX = 45;
                var repulsionForceY = -30;
                var gravityForceX = -40;
                var gravityForceY = -50;

            drawForce(positionX, positionY, springForceX, springForceY, 1);
            drawForce(positionX, positionY, repulsionForceX, repulsionForceY, 2);
            drawForce(positionX, positionY, gravityForceX, gravityForceY, 3);
//          }
        });
  }
};
//
function drawForce(posX, posY, forceX, forceY, type){   
    var zoom = cy.zoom();
    var canvas = $('#forceCanvas');
    var arrow = canvas.drawLine({
      strokeStyle: (type===1)?'#ff0000':(type===2)?'#0000ff':'#00ff00',
      strokeWidth: 4*zoom,
      rounded: true,
      endArrow: true,
      arrowRadius: 10*zoom,
      arrowAngle: 90,
      x1: posX, y1: posY,
      x2: posX + forceX*zoom, y2: posY + forceY*zoom
    });
}

function editForces(){
    cy.on('zoom', function(){
        $('#forceCanvas').clearCanvas();   
        if($('#forcesCheck').is(":checked")){
            screenForces(keyframeNumber);
        }
    });
    cy.on('pan', function(){
        $('#forceCanvas').clearCanvas();   
        if($('#forcesCheck').is(":checked")){
            screenForces(keyframeNumber);
        }
    });
    cy.on('position','node', function(){
        $('#forceCanvas').clearCanvas();   
        if($('#forcesCheck').is(":checked")){
            screenForces(keyframeNumber);
        }
    });
};

function loadCanvas(){
    var canvas = document.createElement('canvas');
    div = document.getElementById("cy"); 
    canvas.id = "forceCanvas";
    canvas.width = 1000;
    canvas.height = 590;
    canvas.style.zIndex = 9;
    canvas.style.position = "absolute";
    div.appendChild(canvas);
};
function screenNodeDetail(){
    cy.on('select', 'node', function(){
        document.getElementById('nodeDetail').style.visibility = "visible";
        document.getElementById('navigator').style.visibility = "hidden";
        var selectedNodes = cy.nodes(":selected");
        $('#nodeDetail').drawText({
            name: 'nodeName',
            fillStyle: '#36c',
            x: 150, y: 10,
            fontSize: '12pt',
            fontStyle: 'bold',
            fontFamily: 'Arial',
            text: selectedNodes.data('name')
        });
        $('#nodeDetail').drawText({
            name: 'springForce',
            fillStyle: '#f00',
            fromCenter: false,
            x: 10, y: 90,
            fontSize: '12pt',
            fontStyle: 'bold',
            fontFamily: 'Arial',
            text: 'Spring: 0.00'
        });
        $('#nodeDetail').drawText({
            name: 'repulsionForce',
            fillStyle: '#00f',
            fromCenter: false,
            x: 10, y: 110,
            fontSize: '12pt',
            fontStyle: 'bold',
            fontFamily: 'Arial',
            text: 'Repulsion: 0.00'
        });
        $('#nodeDetail').drawText({
            name: 'gravityForce',
            fillStyle: '#0f0',
            fromCenter: false,
            x: 10, y: 130,
            fontSize: '12pt',
            fontStyle: 'bold',
            fontFamily: 'Arial',
            text: 'Gravity: 0.00'
        });
    });
    cy.on('unselect', 'node', function(){
        hideNodeDetail();
    });
};
function hideNodeDetail(){
    $('#nodeDetail').clearCanvas();
    document.getElementById("nodeDetail").style.visibility = "hidden";
    document.getElementById("navigator").style.visibility = "visible";  
}