var expandCollapseUtilities = {
    //This is a map which keeps the information of collapsed meta edges to handle them correctly
    collapsedMetaEdgesInfo: {},
    //This map keeps track of the meta levels of edges by their id's
    edgesMetaLevels: {},
    //Some nodes are initilized as collapsed this method handles them
    initCollapsedNodes: function () {
        var nodesToCollapse = cy.nodes().filter(function (i, ele) {
            if (ele.data('expanded-collapsed') == 'collapsed') {
                return true;
            }
        });
        this.simpleCollapseGivenNodes(nodesToCollapse);
    },
    //This method changes source or target id of the collapsed edge data kept in the data of the node
    //with id of createdWhileBeingCollapsed
    alterSourceOrTargetOfCollapsedEdge: function (createdWhileBeingCollapsed, edgeId, sourceOrTarget) {
        var node = cy.getElementById(createdWhileBeingCollapsed)[0];
        var edgesOfcollapsedChildren = node._private.data.edgesOfcollapsedChildren;
        for (var i = 0; i < edgesOfcollapsedChildren.length; i++) {
            var collapsedEdge = edgesOfcollapsedChildren[i];
            if (collapsedEdge._private.data.id == edgeId) {
                collapsedEdge._private.data[sourceOrTarget] = collapsedEdge._private.data.collapsedNodeBeforeBecamingMeta;
                break;
            }
        }
    },
    //Check if there is node to expand or collapse in given nodes according to the given mode parameter
    thereIsNodeToExpandOrCollapse: function (nodes, mode) {
        var thereIs = false;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (mode == "collapse") {
                if (node.children().length > 0) {
                    thereIs = true;
                    break;
                }
            }
            else if (mode == "expand") {
                if (node._private.data.collapsedChildren != null) {
                    thereIs = true;
                    break;
                }
            }
        }

        return thereIs;
    },
    simpleCollapseGivenNodes: function (nodes) {
        nodes.data("collapse", true);
        var roots = sbgnElementUtilities.getTopMostNodes(nodes);
        for (var i = 0; i < roots.length; i++) {
            var root = roots[i];
            this.collapseBottomUp(root);
        }
        return nodes;
    },
    simpleExpandGivenNodes: function (nodes, applyFishEyeViewToEachNode) {
        nodes.data("expand", true);
        var roots = sbgnElementUtilities.getTopMostNodes(nodes);
        for (var i = 0; i < roots.length; i++) {
            var root = roots[i];
            this.expandTopDown(root, applyFishEyeViewToEachNode);
        }
        return nodes;
    },
    simpleExpandAllNodes: function (nodes, selector, applyFishEyeViewToEachNode) {
        if (nodes === undefined) {
            nodes = cy.nodes();
        }
        var orphans;
        if (selector) {
            if (selector === "complex-parent") {
                orphans = cy.nodes().filter(function (i, element) {
                    var parent = element.parent()[0];
                    if (parent && parent.data('sbgnclass') == 'complex') {
                        return false;
                    }
                    return true;
                });
            }
        }
        else {
            orphans = nodes.orphans();
        }
        var expandStack = [];
        for (var i = 0; i < orphans.length; i++) {
            var root = orphans[i];
            this.expandAllTopDown(root, expandStack, applyFishEyeViewToEachNode);
        }
        return expandStack;
    },
    expandAllNodes: function (nodes, selector) {

        var expandedStack = this.simpleExpandAllNodes(nodes, selector, true);

        //triggerIncrementalLayout();

        /*
         * return the nodes to undo the operation
         */
        return expandedStack;
    },
    collapseExpandedStack: function (expandedStack) {
        while (expandedStack.length > 0) {
            var node = expandedStack.pop();
            this.simpleCollapseNode(node);
        }
    },
    expandAllTopDown: function (root, expandStack, applyFishEyeViewToEachNode) {
        if (root._private.data.collapsedChildren != null)
        {
            expandStack.push(root);
            this.simpleExpandNode(root, applyFishEyeViewToEachNode);
        }
        var children = root.children();
        for (var i = 0; i < children.length; i++) {
            var node = children[i];
            this.expandAllTopDown(node, expandStack, applyFishEyeViewToEachNode);
        }
    },
    //Expand the given nodes perform incremental layout after expandation
    expandGivenNodes: function (nodes) {
        this.simpleExpandGivenNodes(nodes, true);

        triggerIncrementalLayout();

        /*
         * return the nodes to undo the operation
         */
        return nodes;
    },
    //collapse the given nodes then make incremental layout
    collapseGivenNodes: function (nodes) {
        this.simpleCollapseGivenNodes(nodes);

        triggerIncrementalLayout();

        /*
         * return the nodes to undo the operation
         */
        return nodes;
    },
    //collapse the nodes in bottom up order starting from the root
    collapseBottomUp: function (root) {
        var children = root.children();
        for (var i = 0; i < children.length; i++) {
            var node = children[i];
            this.collapseBottomUp(node);
        }
        //If the root is a compound node to be collapsed then collapse it
        if (root.data("collapse") && root.children().length > 0)
        {
            this.simpleCollapseNode(root);
            root.removeData("collapse");
        }
    },
    //expand the nodes in top down order starting from the root
    expandTopDown: function (root, applyFishEyeViewToEachNode) {
        if (root.data("expand") && root._private.data.collapsedChildren != null)
        {
            this.simpleExpandNode(root, applyFishEyeViewToEachNode);
            root.removeData("expand");
        }
        var children = root.children();
        for (var i = 0; i < children.length; i++) {
            var node = children[i];
            this.expandTopDown(node);
        }
    },
    //Expand the given node perform incremental layout after expandation
    expandNode: function (node) {
        if (node._private.data.collapsedChildren != null) {

            this.storeWidthHeight(node);
            this.simpleExpandNode(node, true);

            node.data('x-before-collapse', this.xPositionInParent(node));
            node.data('y-before-collapse', this.yPositionInParent(node));

            triggerIncrementalLayout();


            /*
             * return the node to undo the operation
             */
            return node;
        }
    },
    /*
     *
     * This method expands the given node
     * without making incremental layout
     * after expand operation it will be simply
     * used to undo the collapse operation
     */
    simpleExpandNode: function (node, applyFishEyeViewToEachNode) {
        if (node._private.data.collapsedChildren != null) {
            //check how the position of the node is changed
            var positionDiff = {
                x: node.position('x') - node.data('position-before-collapse').x,
                y: node.position('y') - node.data('position-before-collapse').y
            };

            node.removeData("infoLabel");
            node.data('expanded-collapsed', 'expanded');
            node._private.data.collapsedChildren.restore();
            this.repairEdgesOfCollapsedChildren(node);
            node._private.data.collapsedChildren = null;
//      node.removeClass('collapsed');

            cy.nodes().updateCompoundBounds();

            //Don't show children info when the complex node is expanded
            if (node._private.data.sbgnclass == "complex") {
                node.removeStyle('content');
            }

            moveNodes(positionDiff ,node.children());
            node.removeData('position-before-collapse');

            //refreshPaddings();

            if(applyFishEyeViewToEachNode){
                this.fishEyeViewExpandGivenNode(node);
            }

            //return the node to undo the operation
            return node;
        }
    },
    //collapse the given node without making incremental layout
    simpleCollapseNode: function (node) {
        if (node._private.data.collapsedChildren == null) {
            node.data('position-before-collapse', {
                x: node.position().x,
                y: node.position().y
            });
            node.children().unselect();
            node.children().connectedEdges().unselect();

            node.data('expanded-collapsed', 'collapsed');

            var children = node.children();

            //The children info of complex nodes should be shown when they are collapsed
            if (node._private.data.sbgnclass == "complex") {
                //The node is being collapsed store infolabel to use it later
                var infoLabel = getInfoLabel(node);
                node._private.data.infoLabel = infoLabel;
            }

            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                this.barrowEdgesOfcollapsedChildren(node, child);
            }

            this.removeChildren(node, node);
            //refreshPaddings();

            if (node._private.data.sbgnclass == "complex") {
                node.addClass('changeContent');
            }

            node.position(node.data('position-before-collapse'));

            //return the node to undo the operation
            return node;
        }
    },
    //collapse the given node then make incremental layout
    collapseNode: function (node) {
        if (node._private.data.collapsedChildren == null) {
            this.simpleCollapseNode(node);

            triggerIncrementalLayout();

            /*
             * return the node to undo the operation
             */
            return node;
        }
    },

    storeWidthHeight: function (node)
    {
        if (node != null)
        {
            node.data('x-before-collapse', this.xPositionInParent(node));
            node.data('y-before-collapse', this.yPositionInParent(node));
            node.data('width-before-collapse', node.outerWidth());
            node.data('height-before-collapse', node.outerHeight());

            if (node.parent()[0] != null)
            {
                this.storeWidthHeight(node.parent()[0]);
            }
        }

    },

    fishEyeViewExpandGivenNodes: function (nodes)
    {
        nodes.data("expand", true);

        for (var i = 0; i < nodes.length; i++)
        {
            this.fishEyeViewExpandGivenNode(nodes[i]);
        }

        return nodes;
    },

    fishEyeViewExpandGivenNode: function (node)
    {
        var siblings = this.getSiblings(node);

        var x_a = this.xPositionInParent(node);
        var y_a = this.yPositionInParent(node);

        var d_x_left = Math.abs((node.data('width-before-collapse') - node.outerWidth()) / 2);
        var d_x_right = Math.abs((node.data('width-before-collapse') - node.outerWidth()) / 2);
        var d_y_upper = Math.abs((node.data('height-before-collapse') - node.outerHeight()) / 2);
        var d_y_lower = Math.abs((node.data('height-before-collapse') - node.outerHeight()) / 2);

        var abs_diff_on_x = Math.abs(node.data('x-before-collapse') - x_a);
        var abs_diff_on_y = Math.abs(node.data('y-before-collapse') - y_a);

        // Center went to LEFT
        if (node.data('x-before-collapse') > x_a)
        {
            d_x_left = d_x_left + abs_diff_on_x;
            d_x_right = d_x_right - abs_diff_on_x;
        }
        // Center went to RIGHT
        else
        {
            d_x_left = d_x_left - abs_diff_on_x;
            d_x_right = d_x_right + abs_diff_on_x;
        }

        // Center went to UP
        if (node.data('y-before-collapse') > y_a)
        {
            d_y_upper = d_y_upper + abs_diff_on_y;
            d_y_lower = d_y_lower - abs_diff_on_y;
        }
        // Center went to DOWN
        else
        {
            d_y_upper = d_y_upper - abs_diff_on_y;
            d_y_lower = d_y_lower + abs_diff_on_y;
        }

        var xPosInParentSibling = [];
        var yPosInParentSibling = [];

        for (var i = 0; i < siblings.length; i++)
        {
            xPosInParentSibling.push(this.xPositionInParent(siblings[i]));
            yPosInParentSibling.push(this.yPositionInParent(siblings[i]));
        }

        for (var i = 0; i < siblings.length; i++)
        {
            var sibling = siblings[i];

            var x_b = xPosInParentSibling[i];
            var y_b = yPosInParentSibling[i];

            var slope = (y_b - y_a) / (x_b - x_a);

            var d_x = 0;
            var d_y = 0;
            var T_x = 0;
            var T_y = 0;

            // Current sibling is on the LEFT
            if (x_a > x_b)
            {
                d_x = d_x_left;
            }
            // Current sibling is on the RIGHT
            else
            {
                d_x = d_x_right;
            }
            // Current sibling is on the UPPER side
            if (y_a > y_b)
            {
                d_y = d_y_upper;
            }
            // Current sibling is on the LOWER side
            else
            {
                d_y = d_y_lower;
            }

            if (isFinite(slope))
            {
                T_x = Math.min(d_x, (d_y / Math.abs(slope)));
            }

            if (slope !== 0)
            {
                T_y = Math.min(d_y, (d_x * Math.abs(slope)));
            }

            if (x_a > x_b)
            {
                T_x = -1 * T_x;
            }

            if (y_a > y_b)
            {
                T_y = -1 * T_y;
            }

            this.moveNode(sibling, T_x, T_y);
        }

        // Do not call the function for the root!
        if (node.parent()[0] != null)
        {
            this.fishEyeViewExpandGivenNode(node.parent()[0]);
        }

        return node;
    },

    getSiblings: function (node)
    {
        var siblings;

        if (node.parent()[0] == null)
        {
            siblings = cy.collection();
            var orphans = cy.nodes().orphans();

            for (var i = 0; i < orphans.length; i++)
            {
                if (orphans[i] != node)
                {
                    siblings = siblings.add(orphans[i]);
                }
            }
        } else
        {
            siblings = node.siblings();
        }

        return siblings;
    },

    moveNode: function (node, T_x, T_y)
    {
        var childrenList = node.children();

        if (childrenList.length == 0)
        {
            node.position('x', node.position('x') + T_x);
            node.position('y', node.position('y') + T_y);
        }
        else
        {

            for (var i=0; i < childrenList.length; i++)
            {
                this.moveNode(childrenList[i], T_x, T_y);
            }
        }
    },

    xPositionInParent: function (node)
    {
        var parent = node.parent()[0];
        var x_a = 0.0;

        // Given node is not a direct child of the the root graph
        if (parent != null)
        {
            x_a = node.relativePosition('x') + (parent.width() / 2);
        }
        // Given node is a direct child of the the root graph

        else
        {
            x_a = node.position('x');
        }

        return x_a;
    },
    yPositionInParent: function (node)
    {
        var parent = node.parent()[0];

        var y_a = 0.0;

        // Given node is not a direct child of the the root graph
        if (parent != null)
        {
            /*console.log("Node ID: " + node.id());
             console.log("Parent ID: " + parent.id());
             console.log("Parent.width: " + parent.width());
             console.log("Parent.height: " + parent.height());*/
            y_a = node.relativePosition('y') + (parent.height() / 2);
        }
        // Given node is a direct child of the the root graph

        else
        {
            y_a = node.position('y');
        }

        return y_a;
    },

    /*
     * for all children of the node parameter call this method
     * with the same root parameter,
     * remove the child and add the removed child to the collapsedchildren data
     * of the root to restore them in the case of expandation
     * root._private.data.collapsedChildren keeps the nodes to restore when the
     * root is expanded
     */
    removeChildren: function (node, root) {
        var children = node.children();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            this.removeChildren(child, root);
            var removedChild = child.remove();
            if (root._private.data.collapsedChildren == null) {
                root._private.data.collapsedChildren = removedChild;
            }
            else {
                root._private.data.collapsedChildren = root._private.data.collapsedChildren.union(removedChild);
            }
        }
    },
    /*
     * This method let the root parameter to barrow the edges connected to the
     * child node or any node inside child node if the any one the source and target
     * is an outer node of the root node in other word it create meta edges
     */
    barrowEdgesOfcollapsedChildren: function (root, childNode) {
        var children = childNode.children();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            this.barrowEdgesOfcollapsedChildren(root, child);
        }

        var edges = childNode.connectedEdges();
        for (var i = 0; i < edges.length; i++) {
            var edge = edges[i];
            var source = edge.data("source");
            var target = edge.data("target");
            var sourceNode = edge.source();
            var targetNode = edge.target();
            var newEdge = jQuery.extend(true, {}, edge.jsons()[0]);

            //Initilize the meta level of this edge if it is not initilized yet
            if (this.edgesMetaLevels[edge.id()] == null) {
                this.edgesMetaLevels[edge.id()] = 0;
            }

            /*If the edge is meta and has different source and targets then handle this case because if
             * the other end of this edge is removed because of the reason that it's parent is
             * being collapsed and this node is expanded before other end is still collapsed this causes
             * that this edge cannot be restored as one end node of it does not exists.
             * Create a collapsed meta edge info for this edge and add this info to collapsedMetaEdgesInfo
             * map. This info includes createdWhileBeingCollapsed(the node which is being collapsed),
             * otherEnd(the other end of this edge) and oldOwner(the owner of this edge which will become
             * an old owner after collapse operation)
             */
            if (this.edgesMetaLevels[edge.id()] != 0 && source != target) {
                var otherEnd = null;
                var oldOwner = null;
                if (source == childNode.id()) {
                    otherEnd = target;
                    oldOwner = source;
                }
                else if (target == childNode.id()) {
                    otherEnd = source;
                    oldOwner = target;
                }
                var info = {
                    createdWhileBeingCollapsed: root.id(),
                    otherEnd: otherEnd,
                    oldOwner: oldOwner
                };
                if (this.collapsedMetaEdgesInfo[otherEnd] == null) {
                    this.collapsedMetaEdgesInfo[otherEnd] = {};
                }
                if (this.collapsedMetaEdgesInfo[root.id()] == null) {
                    this.collapsedMetaEdgesInfo[root.id()] = {};
                }
                //the information should be reachable by edge id and node id's
                this.collapsedMetaEdgesInfo[root.id()][otherEnd] = info;
                this.collapsedMetaEdgesInfo[otherEnd][root.id()] = info;
                this.collapsedMetaEdgesInfo[edge.id()] = info;
            }

            var removedEdge = edge.remove();
            //store the data of the original edge
            //to restore when the node is expanded
            if (root._private.data.edgesOfcollapsedChildren == null) {
                root._private.data.edgesOfcollapsedChildren = removedEdge;
            }
            else {
                root._private.data.edgesOfcollapsedChildren =
                    root._private.data.edgesOfcollapsedChildren.union(removedEdge);
            }

            //Do not handle the inner edges
            if (!this.isOuterNode(sourceNode, root) && !this.isOuterNode(targetNode, root)) {
                continue;
            }

            //If the change source and/or target of the edge in the
            //case of they are equal to the id of the collapsed child
            if (source == childNode.id()) {
                source = root.id();
            }
            if (target == childNode.id()) {
                target = root.id();
            }

            //prepare the new edge by changing the older source and/or target
            newEdge.data.portsource = source;
            newEdge.data.porttarget = target;
            newEdge.data.source = source;
            newEdge.data.target = target;
            //remove the older edge and add the new one
            cy.add(newEdge);
            var newCyEdge = cy.edges()[cy.edges().length - 1];
            //If this edge has not meta class properties make it meta
            if (this.edgesMetaLevels[newCyEdge.id()] == 0) {
                newCyEdge.addClass("meta");
            }
            //Increase the meta level of this edge by 1
            this.edgesMetaLevels[newCyEdge.id()]++;
            newCyEdge.data("collapsedNodeBeforeBecamingMeta", childNode.id());
        }
    },
    /*
     * This method repairs the edges of the collapsed children of the given node
     * when the node is being expanded, the meta edges created while the node is
     * being collapsed are handled in this method
     */
    repairEdgesOfCollapsedChildren: function (node) {
        var edgesOfcollapsedChildren = node._private.data.edgesOfcollapsedChildren;
        if (edgesOfcollapsedChildren == null) {
            return;
        }
        var collapsedMetaEdgeInfoOfNode = this.collapsedMetaEdgesInfo[node.id()];
        for (var i = 0; i < edgesOfcollapsedChildren.length; i++) {
            //Handle collapsed meta edge info if it is required
            if (collapsedMetaEdgeInfoOfNode != null &&
                this.collapsedMetaEdgesInfo[edgesOfcollapsedChildren[i]._private.data.id] != null) {
                var info = this.collapsedMetaEdgesInfo[edgesOfcollapsedChildren[i]._private.data.id];
                //If the meta edge is not created because of the reason that this node is collapsed
                //handle it by changing source or target of related edge datas
                if (info.createdWhileBeingCollapsed != node.id()) {
                    if (edgesOfcollapsedChildren[i]._private.data.source == info.oldOwner) {
                        edgesOfcollapsedChildren[i]._private.data.source = info.createdWhileBeingCollapsed;
                        this.alterSourceOrTargetOfCollapsedEdge(info.createdWhileBeingCollapsed
                            , edgesOfcollapsedChildren[i]._private.data.id, "target");
                    }
                    else if (edgesOfcollapsedChildren[i]._private.data.target == info.oldOwner) {
                        edgesOfcollapsedChildren[i]._private.data.target = info.createdWhileBeingCollapsed;
                        this.alterSourceOrTargetOfCollapsedEdge(info.createdWhileBeingCollapsed
                            , edgesOfcollapsedChildren[i]._private.data.id, "source");
                    }
                }
                //Delete the related collapsedMetaEdgesInfo's as they are handled
                delete this.collapsedMetaEdgesInfo[info.createdWhileBeingCollapsed][info.otherEnd];
                delete this.collapsedMetaEdgesInfo[info.otherEnd][info.createdWhileBeingCollapsed];
                delete this.collapsedMetaEdgesInfo[edgesOfcollapsedChildren[i]._private.data.id];
            }
            var oldEdge = cy.getElementById(edgesOfcollapsedChildren[i]._private.data.id);
            //If the edge is already in the graph remove it and decrease it's meta level
            if (oldEdge != null && oldEdge.length > 0) {
                this.edgesMetaLevels[edgesOfcollapsedChildren[i]._private.data.id]--;
                oldEdge.remove();
            }
        }
        edgesOfcollapsedChildren.restore();

        //Check for meta levels of edges and handle the changes
        for (var i = 0; i < edgesOfcollapsedChildren.length; i++) {
            var edge = edgesOfcollapsedChildren[i];
            if (this.edgesMetaLevels[edge.id()] == null || this.edgesMetaLevels[edge.id()] == 0) {
                edge.removeClass("meta");
            }
            else {
                edge.addClass("meta");
            }
        }

        node._private.data.edgesOfcollapsedChildren = null;
    },
    /*node is an outer node of root
     if root is not it's anchestor
     and it is not the root itself*/
    isOuterNode: function (node, root) {
        var temp = node;
        while (temp != null) {
            if (temp == root) {
                return false;
            }
            temp = temp.parent()[0];
        }
        return true;
    },
    /*
     * This method is to handle the collapsed elements while the
     * dynamic paddings are being calculated
     */
    getCollapsedChildrenData: function (collapsedChildren, numOfSimples, total) {
        for (var i = 0; i < collapsedChildren; i++) {
            var collapsedChild = collapsedChildren[i];
            if (collapsedChild._private.data.collapsedChildren == null
                || collapsedChild._private.data.collapsedChildren.length == 0) {
                total += Number(collapsedChild._private.data.sbgnbbox.w);
                total += Number(collapsedChild._private.data.sbgnbbox.h);
                numOfSimples++;
            }
            else {
                var result = this.getCollapsedChildrenData(
                    collapsedChild._private.data.collapsedChildren,
                    numOfSimples,
                    total);
                numOfSimples = result.numOfSimples;
                total = result.total;
            }
        }
        return {
            numOfSimples: numOfSimples,
            total: total
        };
    }
};