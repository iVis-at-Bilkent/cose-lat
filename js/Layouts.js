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
        
    editForces();
    normalizeForces();
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
});
$("#cose-bilkent").css("background-color", "grey");

function refreshCytoscape(graphData) { // on dom ready
    cy = cytoscape({
        container: $('#cy')[0],
        style:
            cytoscape.stylesheet()
            .selector('node')
            .css({
                'content': 'data(name)',
                'background-color': '#aaa',
                'border-width': 1,
                'border-color': 'black',
                'text-valign': 'bottom',
                'color': 'white',
                'text-outline-width': 2,
                'text-outline-color': '#888',
                'shape': 'rectangle'
            })
            .selector('node:selected')
            .css({
                'background-color': 'black',
                'line-color': 'black',
                'target-arrow-color': 'black',
                'source-arrow-color': 'black',
                'text-outline-color': 'black',
                'border-color': 'black',
                'border-width': 5
            })
            .selector('node:parent')
            .css({
                'content': 'data(name)',
                'background-opacity': 0.333,
                'text-valign': "bottom"
            })
            .selector('edge')
            .css({
                'background-color': 'black',
                'line-color': 'black',
                'target-arrow-color': 'red',
                'source-arrow-color': 'black',
                'text-outline-color': 'black',
                'curve-style': "bezier"
            })
            .selector('edge:selected')
            .css({
                'background-color': 'black',
                'line-color': 'black',
                'width': 5,
                'opacity':1,
                'color' : 'black'
            }),

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

//            var getNodesData = function () {
//                var nodesData = {};
//                var nodes = cy.nodes();
//                for (var i = 0; i < nodes.length; i++) {
//                    var node = nodes[i];
//                    nodesData[node.id()] = {
//                        width: node.width(),
//                        height: node.height(),
//                        x: node.position("x"),
//                        y: node.position("y")
//                    };
//                }
//                return nodesData;
//            };
//
//            var enableDragAndDropMode = function () {
//                window.dragAndDropModeEnabled = true;
//                $("#sbgn-network-container").addClass("target-cursor");
//                cy.autolock(true);
//                cy.autounselectify(true);
//            };
//
//            var disableDragAndDropMode = function () {
//                window.dragAndDropModeEnabled = null;
//                window.nodeToDragAndDrop = null;
//                $("#sbgn-network-container").removeClass("target-cursor");
//                cy.autolock(false);
//                cy.autounselectify(false);
//            };
//
//            var lastMouseDownNodeInfo = null;
//            this.on("mousedown", "node", function () {
//                var self = this;
//                lastMouseDownNodeInfo = {};
//                lastMouseDownNodeInfo.lastMouseDownPosition = {
//                    x: this.position("x"),
//                    y: this.position("y")
//                };
//                lastMouseDownNodeInfo.node = this;
//            });
//
//            this.on("mouseup", "node", function () {
//                if (lastMouseDownNodeInfo == null) {
//                    return;
//                }
//                var node = lastMouseDownNodeInfo.node;
//                var lastMouseDownPosition = lastMouseDownNodeInfo.lastMouseDownPosition;
//                var mouseUpPosition = {
//                    x: node.position("x"),
//                    y: node.position("y")
//                };
//                if (mouseUpPosition.x != lastMouseDownPosition.x ||
//                    mouseUpPosition.y != lastMouseDownPosition.y) {
//                    var positionDiff = {
//                        x: mouseUpPosition.x - lastMouseDownPosition.x,
//                        y: mouseUpPosition.y - lastMouseDownPosition.y
//                    };
//
//                    var nodes;
//                    if (node.selected()) {
//                        nodes = cy.nodes(":visible").filter(":selected");
//                    }
//                    else {
//                        nodes = [];
//                        nodes.push(node);
//                    }
//
//                    var param = {
//                        positionDiff: positionDiff,
//                        nodes: nodes, move: false
//                    };
//                    editorActionsManager._do(new MoveNodeCommand(param));
//
//                    lastMouseDownNodeInfo = null;
//                    refreshUndoRedoButtonsStatus();
//                }
//            });
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
};

var COSEBilkentLayout = Backbone.View.extend({
    defaultLayoutProperties: {
        name: 'cose-bilkent',
        ready: function () {
        },
        // Called on `layoutstop`
        stop: function () {
        },
        // number of ticks per frame; higher is faster but more jerky
        refresh: 30, 
        // Whether to fit the network view after when done
        fit: true,
        // Padding on fit
        padding: 20,
        // Whether to enable incremental mode
        randomize: true,
        // Node repulsion (non overlapping) multiplier
        nodeRepulsion: 4500,
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
        // For enabling tiling
        tile: true,
        //whether to make animation while performing the layout
        animate: 'during',
        // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
        tilingPaddingVertical: 10,
        // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
        tilingPaddingHorizontal: 10,
        // Gravity range (constant) for compounds
        gravityRangeCompound: 1.5,
        // Gravity force (constant) for compounds
        gravityCompound: 1.0,
        // Gravity range (constant)
        gravityRange: 3.8
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

        $(self.el).dialog({width:300, closeText: ""}).prev(".ui-dialog-titlebar").css("background","#5bc0de");;

        $("#save-layout").click( function (evt) {
            self.currentLayoutProperties.refresh = Number(document.getElementById("refresh").value);
            self.currentLayoutProperties.padding = Number(document.getElementById("padding").value);
            self.currentLayoutProperties.nodeRepulsion = Number(document.getElementById("node-repulsion").value);
            self.currentLayoutProperties.idealEdgeLength = Number(document.getElementById("ideal-edge-length").value);
            self.currentLayoutProperties.edgeElasticity = Number(document.getElementById("edge-elasticity").value);
            self.currentLayoutProperties.nestingFactor = Number(document.getElementById("nesting-factor").value);
            self.currentLayoutProperties.gravity = Number(document.getElementById("gravity").value);
            self.currentLayoutProperties.numIter = Number(document.getElementById("num-iter").value);
            self.currentLayoutProperties.tilingPaddingVertical = Number(document.getElementById("tiling-padding-vertical").value);            
            self.currentLayoutProperties.tilingPaddingHorizontal = Number(document.getElementById("tiling-padding-horizontal").value);                       
            self.currentLayoutProperties.gravityRangeCompound = Number(document.getElementById("gravity-range-compound").value);             
            self.currentLayoutProperties.gravityCompound = Number(document.getElementById("gravity-compound").value);            
            self.currentLayoutProperties.gravityRange = Number(document.getElementById("gravity-range").value);            
            //self.currentLayoutProperties.fit = document.getElementById("fit").checked;            
            self.currentLayoutProperties.randomize = document.getElementById("randomize").checked;            
            self.currentLayoutProperties.tile = document.getElementById("tile").checked;
            if(document.getElementById("animate").checked === true){
                self.currentLayoutProperties.animate = 'during';
            }
            else {
                self.currentLayoutProperties.animate = false;
            }
            $(self.el).dialog('close');

        });

        $("#default-layout").click( function (evt) {
            self.copyProperties();
            var temp = _.template($("#cose-bilkent-settings-template").html());
            self.template = temp(self.currentLayoutProperties);
            $(self.el).html(self.template);
        });

        return this;
    }
});

var whitenBackgrounds = function(){
    $("#cose-bilkent").css("background-color", "white");
};

var animatedData = [];
var numberOfKeyframes;
window.addEventListener('send', function (e) { 
    animatedData.push(e.detail);
}, false);

var normalizeRatio;
var normalizeRatio2;
var normalizeForces = function(){
    cy.on('layoutstop', function(){
       var maxForce = -10000;
       var minForce = 10000;
       for(i = 0; i<animatedData.length; i++){
           for(j = 0; j<Object.values(animatedData[i]).length; j++){
               var tempMax = Math.max(Object.values(animatedData[i])[j].springForceX, Object.values(animatedData[i])[j].springForceY, Object.values(animatedData[i])[j].repulsionForceX, Object.values(animatedData[i])[j].repulsionForceY, Object.values(animatedData[i])[j].gravitationForceX, Object.values(animatedData[i])[j].gravitationForceY);                        
               var tempMin = Math.min(Object.values(animatedData[i])[j].springForceX, Object.values(animatedData[i])[j].springForceY, Object.values(animatedData[i])[j].repulsionForceX, Object.values(animatedData[i])[j].repulsionForceY, Object.values(animatedData[i])[j].gravitationForceX, Object.values(animatedData[i])[j].gravitationForceY);                        
            if(tempMax > maxForce){
                maxForce = tempMax;
            }
            if(tempMin < minForce){
                minForce = tempMin;
            }
           }
       }
       normalizeRatio = Math.max(Math.abs(maxForce), Math.abs(minForce)) / 60;
       normalizeRatio2 = Math.max(Math.abs(maxForce), Math.abs(minForce)) / 100;
    });
};

var screenNodes = function(keyframeNumber){
    var dataToScreen = animatedData[keyframeNumber];
    if (dataToScreen != null) {
        cy.nodes().positions(function (i, ele) {
          if (ele.scratch('coseBilkent') && ele.scratch('coseBilkent').dummy_parent_id) {
            var dummyParent = ele.scratch('coseBilkent').dummy_parent_id;
            return {
                x: dummyParent.x,
                y: dummyParent.y
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
      
        if($('#fitCheck').is(":checked") && cy.nodes(":selected").length > 0){
            if(cy.nodes(":selected").length == 1 && cy.nodes(":selected").isParent() == false){
                cy.fit(cy.nodes(":selected"), 250);
            }
            else{             
                cy.fit(cy.nodes(":selected"), 100);
            }
        }
        else {
           var tempLayout = new COSEBilkentLayout();
           cy.fit(cy.nodes(), tempLayout.currentLayoutProperties.padding); 
        }
//        if (!ready) {
//            ready = true;
//            cy.one('layoutready', tempLayout.currentLayoutProperties.ready);
//            cy.trigger({type: 'layoutready', layout: 'cose-bilkent'});
//        }
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
            var theId = ele.data('id');
            var pNode = dataToScreen[theId];
            var temp = this;
            while (pNode == null) {
              temp = temp.parent()[0];
              pNode = dataToScreen[temp.id()];
              dataToScreen[theId] = pNode;
            }

                var positionX = ele.renderedPosition('x');
                var positionY = ele.renderedPosition('y');
                var springForceX = pNode.springForceX / normalizeRatio2;
                var springForceY = pNode.springForceY / normalizeRatio2;
                var repulsionForceX = pNode.repulsionForceX / normalizeRatio2;
                var repulsionForceY = pNode.repulsionForceY / normalizeRatio2;
                var gravitationForceX = pNode.gravitationForceX / normalizeRatio2;
                var gravitationForceY = pNode.gravitationForceY / normalizeRatio2;

                var canvas = $('#forceCanvas');
                if(springForceX != 0 && springForceY != 0){
                    drawForce(canvas, positionX, positionY, springForceX, springForceY, 1);
                }
                if(repulsionForceX != 0 && repulsionForceY != 0){
                    drawForce(canvas, positionX, positionY, repulsionForceX, repulsionForceY, 2);
                }
                if(gravitationForceX != 0 && gravitationForceY != 0){
                    drawForce(canvas, positionX, positionY, gravitationForceX, gravitationForceY, 3);
                }
//          }
        });
  }
};
//
function drawForce(canvas, posX, posY, forceX, forceY, type){   
    var zoom = cy.zoom();
    if(canvas.selector == '#nodeDetail'){
        zoom = 1;
    }
    canvas.drawLine({
      strokeStyle: (type==1)?'#FF0000':(type==2)?'#0000FF':'#8DB600',
      strokeWidth: 3*zoom,
      rounded: true,
      endArrow: true,
      arrowRadius: 5*zoom,
      arrowAngle: 90,
      x1: posX, y1: posY,
      x2: posX + forceX*zoom, y2: posY + forceY*zoom
    });
}

function editForces(){
    cy.on('zoom pan position', function(){
        $('#forceCanvas').clearCanvas();   
        if($('#forcesCheck').is(":checked")){
            screenForces(keyframeNumber);
        }
    });
    cy.on('select','node', function(event){
        if(cy.nodes(":selected").length == 1 && slider.getAttribute("active")){
            showNodeDetail();
            var selectedNode = event.cyTarget;
            screenNodeDetail(selectedNode);
        }
        else{
            hideNodeDetail();
        }
        if($('#fitCheck').is(":checked") && slider.getAttribute("active")){
            if(cy.nodes(":selected").length == 1 && cy.nodes(":selected").isParent() == false){
                cy.fit(cy.nodes(":selected"), 250);
            }
            else{               
                cy.fit(cy.nodes(":selected"), 100);
            }
        }
    });
    cy.on('unselect', 'node', function(){
        if(cy.nodes(":selected").length == 1 && slider.getAttribute("active")){
            showNodeDetail();
            screenNodeDetail(cy.nodes(":selected"));
        }
        else{
            hideNodeDetail();
        }
        if($('#fitCheck').is(":checked") && slider.getAttribute("active")){
            if(cy.nodes(":selected").length != 0){
                if(cy.nodes(":selected").length == 1 && cy.nodes(":selected").isParent() == false){
                   cy.fit(cy.nodes(":selected"), 250);
                }
                else{                
                    cy.fit(cy.nodes(":selected"), 100);
                }
            }
            else{
                var tempLayout = new COSEBilkentLayout();
                cy.fit(cy.nodes(), tempLayout.currentLayoutProperties.padding);                 
            }
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
function screenNodeDetail(selectedNode){
    var dataToScreen = animatedData[keyframeNumber];
    var pNode;
    if (dataToScreen != null) {
        var theId = selectedNode.data('id');
        pNode = dataToScreen[theId];
        var temp = this;
        while (pNode == null) {
            temp = temp.parent()[0];
            pNode = dataToScreen[temp.id()];
            dataToScreen[theId] = pNode;
        }
    }
    var canvas = $('#nodeDetail');
    if(pNode.springForceX != 0 && pNode.springForceY != 0){
        drawForce(canvas, 225, 80, pNode.springForceX/normalizeRatio, pNode.springForceY/normalizeRatio, 1);
    }
    if(pNode.repulsionForceX != 0 && pNode.repulsionForceY != 0){
        drawForce(canvas, 225, 80, pNode.repulsionForceX/normalizeRatio, pNode.repulsionForceY/normalizeRatio, 2);
    }
    if(pNode.gravitationForceX != 0 && pNode.gravitationForceY != 0){
        drawForce(canvas, 225, 80, pNode.gravitationForceX/normalizeRatio, pNode.gravitationForceY/normalizeRatio, 3);
    }
    $('#nodeDetail').drawText({
        name: 'nodeName',
        fillStyle: '#36c',
        x: 150, y: 10,
        fontSize: '12pt',
        fontStyle: 'bold',
        fontFamily: 'Arial',
        text: selectedNode.data('name')
    });
    $('#nodeDetail').drawText({
        name: 'springForce',
        fillStyle: '#FF0000',
        fromCenter: false,
        x: 10, y: 70,
        fontSize: '11pt',
        fontFamily: 'Arial',
        text: 'SF: '.concat((pNode.springForceX).toFixed(2), ', ', (pNode.springForceY).toFixed(2))
    });
    $('#nodeDetail').drawText({
        name: 'repulsionForce',
        fillStyle: '#0000FF',
        fromCenter: false,
        x: 10, y: 90,
        fontSize: '11pt',
        fontFamily: 'Arial',
        text: 'RF: '.concat((pNode.repulsionForceX).toFixed(2), ', ', (pNode.repulsionForceY).toFixed(2))
    });
    $('#nodeDetail').drawText({
        name: 'gravityForce',
        fillStyle: '#8DB600',
        fromCenter: false,
        x: 10, y: 110,
        fontSize: '11pt',
        fontFamily: 'Arial',
        text: 'GF: '.concat((pNode.gravitationForceX).toFixed(2), ', ', (pNode.gravitationForceY).toFixed(2))
    });        
    $('#nodeDetail').drawText({
        name: 'displacement',
        fillStyle: '#967117',
        fromCenter: false,
        x: 10, y: 130,
        fontSize: '11pt',
        fontFamily: 'Arial',
        text: 'D: '.concat((pNode.displacementX).toFixed(2), ', ', (pNode.displacementY).toFixed(2))
    });
};

function showNodeDetail(){
    document.getElementById('nodeDetail').style.visibility = "visible";
    document.getElementById('navigator').style.visibility = "hidden"; 
}
function hideNodeDetail(){
    $('#nodeDetail').clearCanvas();
    document.getElementById("nodeDetail").style.visibility = "hidden";
    document.getElementById("navigator").style.visibility = "visible";  
}