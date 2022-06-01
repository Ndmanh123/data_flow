<template>
  <div id="main">
    <div ref="Toolbar" id="Toolbar">
      <button id="btn-zoomout" class="btn">zoom out</button>
      <button id="btn-zoomin" class="btn">zoom in</button>
      <button id="btn-center" class="btn">center</button>
      <button id="btn-center-content" class="btn">center content</button>
    </div>
    <div ref="nodeStencile" id="stencil"></div>

    <div id="paper"></div>
    <div id="navigator"></div>
  </div>
</template>

<script>
export default {
  name: "DataFlow",
  props: {
    width: {
      type: [String, Number],
      default: 800,
    },
    height: {
      type: [String, Number],
      default: 650,
    },
    gridSize: {
      type: Number,
      default: 10,
    },
    drawGrid: {
      type: [Object, Boolean],
      default: true,
    },

    highLightLinks: {
      type: Array,
      default() {
        return [];
      },
    },
    nodes: {
      type: [Object, Boolean],
      default: [
        {
          id: "fd9c3b76-efea-436f-9bd5-ac2ba665d512",
          name: "load",
          position: { x: 250, y: 250 },
          type: "Rectangle",
        },
        {
          id: "4b20a9c1-bdbf-44fa-a64c-3ac11c377f84",
          name: "filter",
          position: { x: 550, y: 250 },
          type: "Rectangle",
        },
        {
          id: "fd45s2v9-bdbf-44fa-a64c-3ac11c377f84",
          name: "filter",
          position: { x: 250, y: 450 },
          type: "Rectangle",
        },
      ],
    },
    links: {
      type: [Object, Boolean],
      default:
        // false,
        [
          {
            source: "fd9c3b76-efea-436f-9bd5-ac2ba665d512",
            target: "4b20a9c1-bdbf-44fa-a64c-3ac11c377f84",
          },
          {
            source: "fd45s2v9-bdbf-44fa-a64c-3ac11c377f84",
            target: "4b20a9c1-bdbf-44fa-a64c-3ac11c377f84",
          },
        ],
    },
  },

  data() {
    return {
      stencilShapes: [],
      selectionNode: null,
      selectedElement: null,
      selectedLink: null,

      //check ctrl shift
      ctrlDown: false,
      shiftDown: false,
      color: "rgb(255 136 0)",
      arr: [
        "filter",
        "formula",
        "join",
        "load",
        "pivot",
        "sample",
        "script",
        "select",
        "sort",
        "summarize",
        "transposeTable",
        "union",
        "weightAvg",
      ],
    };
  },
  created() {
    this.graph = new joint.dia.Graph();
  },
  mounted() {
    this.initPaper();
    // this.center()
  },
  methods: {
    // center() {
    //   _.bind(self.paperScroller.centerContent, self.paperScroller);
    // },
    initPaper() {
      let graph = this.graph;
      this.commandManager = new joint.dia.CommandManager({
        graph: graph,
        cmdBeforeAdd: (cmdName, cell, graph, options = {}) => {
          return !options.ignoreCommandManager;
        },
      });
      this.paper = new joint.dia.Paper({
        width: this.width,
        height: this.height,
        model: this.graph,
        async: true,
        sorting: joint.dia.Paper.sorting.APPROX,
        gridSize: this.gridSize,
        drawGrid: this.drawGrid,
        restrictTranslate: true,
        stopDelegation: false,

        interactive: { vertexAdd: false },
        // background: { color: '#F3F7F6' },
        // defaultConnectionPoint: { name: 'boundary' },
        // defaultConnector: {
        //     name: "rounded"
        //   },
        //   defaultRouter: {
        //     name: "manhattan",
        //     args: {
        //       step: 10,
        //       endDirections: ["bottom"],
        //       startDirections: ["top"],
        //       padding: { bottom: 20 }
        //     }
        //   },
        snapLinks: {
          radius: 75,
        },
        linkPinning: false,
        multiLinks: false,
        defaultRouter: { name: "manhattan", args: { padding: 10 } },
        defaultConnector: { name: "rounded" },
        validateConnection: function (
          cellViewS,
          magnetS,
          cellViewT,
          magnetT,
          end,
          linkView
        ) {
          // Prevent linking from input ports.
          if (magnetS && magnetS.getAttribute("port-group") === "in")
            return false;
          // Prevent linking from output ports to input ports within one element.
          if (cellViewS === cellViewT) return false;
          // Prevent linking to input ports.
          return (
            (magnetT && magnetT.getAttribute("port-group") === "in") ||
            (cellViewS.model.get("type") === "qad.Question" &&
              cellViewT.model.get("type") === "qad.Answer")
          );
        },
        // validateConnection: function (view1, _magnet1, view2, _magnet2) {
        //     // Do not allow loop links (Element to Link, Element A to Element B is valid).
        //     return view1 !== view2;
        // },
        interactive: {
          linkMove: true,
          labelMove: true,
          arrowheadMove: true,
          vertexMove: false,
          vertexAdd: false,
          vertexRemove: false,
          useLinkTools: false,
        },
        defaultLink: function () {
          return new joint.shapes.standard.Link({
            attrs: {
              z: 1,
              line: {
                connection: true,
                stroke: "#707070",
                strokeWidth: 2,
                strokeLinejoin: "round",
              },
              wrapper: {
                connection: true,
                strokeWidth: 10,
                strokeLinejoin: "round",
              },
            },

            markup: [
              {
                tagName: "path",
                selector: "wrapper",
                attributes: {
                  fill: "none",

                  stroke: "transparent",
                },
              },
              {
                tagName: "path",
                selector: "line",
                attributes: {
                  fill: "none",
                },
              },
            ],
          });
        },
      });
      var targetArrowheadTool = new joint.linkTools.TargetArrowhead();
      this.toolsView = new joint.dia.ToolsView({
        tools: [
          // verticesTool, segmentsTool,
          // sourceArrowheadTool,
          targetArrowheadTool,
          // sourceAnchorTool, targetAnchorTool,
          // boundaryTool, removeButton
        ],
      });
      // var elementView = element.findView(this.paper);
      // elementView.addTools(this.toolsView);
      // var linkView = this.link.findView(this.paper);
      // linkView.addTools(this.toolsView);
      this.paperScroller = new joint.ui.PaperScroller({
        paper: this.paper,
        autoResizePaper: true,
        scrollWhileDragging: true,
        cursor: "grab",
      });
      this.selection = new joint.ui.Selection({
        theme: "material",
        paper: this.paper,
        useModelGeometry: true,
        allowTranslate: true,
      });
      this.selection.removeHandle("rotate");
      this.selection.removeHandle("resize");

      this.toolbar = new joint.ui.Toolbar({
        // initialize tools with default settings
        tools: ["zoomIn", "zoomOut", "zoomToFit", "zoomSlider", "undo", "redo"],
        references: {
          paperScroller: this.paperScroller,
          commandManager: this.commandManager,
        },
      });
      document.getElementById("Toolbar").appendChild(this.toolbar.render().el);

      this.snaplines = new joint.ui.Snaplines({ paper: this.paper });
      this.snaplines.startListening();
      //render paper
      document
        .getElementById("paper")
        .appendChild(this.paperScroller.render().el);
      //render paperScroller
      this.highlighters = joint.highlighters;
      this.paperScroller.$el
        .css({ width: 800, height: 600 })
        .appendTo("#paper");

      this.addStencil();

      this.handlePaperEvents();
      this.btnHandler();
      this.selection.collection.reset(graph.getElements());
      this.render();
      this.paperScroller.center();
      // _.bind(this.paperScroller.centerContent, this.paperScroller)
      // this.paperScroller.centerContent();
      // this.paperScroller.adjustPaper();
      // this.paperScroller.zoomToFit({ padding: 200 });
    },
    jsUcfirst(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    stencilRenderHandler(
      positionX,
      positionY,
      arr,
      elNoInPorts = "",
      spaceBetweenElToX = 0,
      spaceBetweenElToY = 0
    ) {
      this.customEl = joint.dia.Element.define("standard.Rectangle", {
        z: 1,
        size: {
          width: 44,
          height: 35,
        },
        removable: false,
        attrs: {
          image: {
            x: 5,
            y: 5,
            width: "calc(w-10)",
            height: "calc(h-10 )",
          },
          root: {
            magnet: false,
          },
          body: {
            fill: "#FFFFFF",
            stroke: "#A0A0A0",
            width: "calc(w)",
            height: "calc(h)",
            strokeWidth: 2,
            rx: 5,
            ry: 5,
          },
        },
        ports: {
          items: [
            {
              id: "out-port",
              group: "out",
            },
            {
              id: "in-port",
              group: "in",
            },
          ],
          groups: {
            out: {
              markup: [
                {
                  tagName: "circle",
                  selector: "portBody",
                },
              ],
              position: {
                name: "right",
              },
              attrs: {
                portBody: {
                  r: 5,
                  magnet: "active",
                  fill: "#187BD3",
                  stroke: "#187BD3",
                },
              },
            },
            in: {
              markup: [
                {
                  tagName: "circle",
                  selector: "portBody",
                },
              ],
              position: {
                name: "left",
              },
              attrs: {
                portBody: {
                  r: 5,
                  magnet: "passive",
                  fill: "#FFFFFF",
                  stroke: "#187BD3",
                },
              },
            },
          },
        },
        markup: [
          {
            tagName: "rect",
            selector: "body",
          },
          {
            tagName: "image",
            selector: "image",
          },
          {
            tagName: "ports",
            selector: "ports",
          },
        ],
      });
      this.customElNoInPorts = joint.dia.Element.define("standard.Rectangle", {
        z: 1,
        theme: "material",
        size: {
          width: 44,
          height: 35,
        },
        removable: false,
        attrs: {
          image: {
            x: 5,
            y: 5,
            width: "calc(w-10)",
            height: "calc(h-10 )",
          },
          root: {
            magnet: false,
          },
          body: {
            fill: "#FFFFFF",
            stroke: "#A0A0A0",
            width: "calc(w)",
            height: "calc(h)",
            strokeWidth: 2,
          },
          line: {
            connection: true,
            stroke: "#333333",
            strokeWidth: 2,
            strokeLinejoin: "round",
            targetMarker: {
              type: "path",
              d: "M 10 -5 0 0 10 5 z",
            },
          },
        },
        ports: {
          items: [
            {
              id: "out-port",
              group: "out",
            },
          ],
          groups: {
            out: {
              markup: [
                {
                  tagName: "circle",
                  selector: "portBody",
                },
              ],
              position: {
                name: "right",
              },
              attrs: {
                portBody: {
                  r: 5,
                  magnet: "active",
                  fill: "#187BD3",
                  stroke: "#187BD3",
                },
              },
            },
          },
        },
        markup: [
          {
            tagName: "rect",
            selector: "body",
          },
          {
            tagName: "image",
            selector: "image",
          },
          {
            tagName: "ports",
            selector: "ports",
          },
        ],
      });
      arr.forEach((element) => {
        //chuyển thành hoa chữ đầu cho đúng định dạng file ảnh lưu
        let elementName = this.jsUcfirst(element);
        if (elementName === this.jsUcfirst(elNoInPorts)) {
          element = new this.customElNoInPorts();
        } else {
          element = new this.customEl();
        }
        element.prop(
          "attrs/image/xlinkHref",
          require(`../assets/${elementName}.svg`)
        );
        this.stencilShapes.push(element.position(positionX, positionY));
        if (spaceBetweenElToX > 0) {
          positionX += element.attributes.size.width + spaceBetweenElToX;
        }
        if (spaceBetweenElToY > 0) {
          positionY += element.attributes.size.height + spaceBetweenElToY;
        }
      });
    },

    addStencil() {
      let graph = this.graph;
      let paper = this.paper;
      var stencil = new joint.ui.Stencil({
        paper: this.paperScroller,
        width: 900,
        height: 60,
        dropAnimation: { duration: 200, easing: "swing" },
      });

      this.stencilRenderHandler(20, 20, this.arr, "load", 16);
      document.getElementById("stencil").appendChild(stencil.render().el);
      stencil.load(this.stencilShapes);
    },
    getElementPredecessorLinks(el) {
      let graph = this.graph;

      return graph
        .getSubgraph([el, ...graph.getPredecessors(el)])
        .filter((cell) => cell.isLink());
    },
    highlightCell(cell) {
      let self = this;
      if (cell) {
        self.highlighters.addClass.add(
          cell.findView(self.paper),
          cell.isElement() ? "body" : "line",
          "selection",
          { className: "selection" }
        );
      } else {
        return;
      }
    },
    unhighlightCell(cell) {
      let self = this;
      if (cell) {
        self.highlighters.addClass.remove(
          cell.findView(self.paper),
          "selection"
        );
      } else {
        return;
      }
    },
    selectElement(el) {
      let self = this;
      let graph = self.graph;
      if (self.selectionNode === el) return;
      if (self.selectionNode) {
        self.unhighlightCell(self.selectionNode);
        graph.getLinks().forEach((link) => self.unhighlightCell(link));
      }
      if (el) {
        self.highlightCell(el);
        self.getElementPredecessorLinks(el).forEach((link) => {
          self.highlightCell(link);
          link.toFront({ ignoreCommandManager: true });
        });
        self.selectionNode = el;
      } else {
        self.selectionNode = null;
      }
    },
    addHaloAndTooltip(cellView) {
      if (
        cellView.model instanceof joint.dia.Link &&
        cellView.model.attributes.target.id === undefined
      )
        return;
      // {
      //   console.log(cellView.model.attributes.target.id=== undefined)
      //   if(cellView.model.attributes.target.id){
      //       console.log(1)
      //   }

      // }
      // if (cellView.model instanceof joint.dia.Link &&cellView.model.attributes.target.id =="undefined") return;
      this.halo = new joint.ui.Halo({
        cellView: cellView,
        type: "toolbar",
        boxContent: false, // bang phia duoi cell cho biet tọa độ height width và angle
      });
      this.halo.changeHandle("remove", { position: "se" });
      this.halo.changeHandle("remove", {
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip": "Click to remove the object",
            "data-tooltip-position": "bottom",
          },
        },
      });
      this.halo.changeHandle("fork", {
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip":
              "Click and drag to clone and connect the object in one go",
            "data-tooltip-position": "bottom",
          },
        },
      });
      this.halo.changeHandle("clone", {
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip": "Click and drag to clone the object",
            "data-tooltip-position": "bottom",
          },
        },
      });
      this.halo.changeHandle("unlink", {
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip": "Click to break all connections to other objects",
            "data-tooltip-position": "bottom",
          },
        },
      });
      this.halo.changeHandle("link", {
        attrs: {
          ".handle": {
            "data-tooltip-class-name": "small",
            "data-tooltip": "Click and drag to connect the object",
            "data-tooltip-position": "bottom",
          },
        },
      });
      new joint.ui.Tooltip({
        rootTarget: document.body,
        target: "[data-tooltip]",
        padding: 15,
      });

      this.halo.removeHandle("resize");
      this.halo.removeHandle("rotate");
      this.halo.removeHandle("direction");
      this.halo.render();
    },

    handlePaperEvents() {
      let self = this;
      let paper = self.paper;
      let graph = self.graph;
      //nếu bấm thì =true
      document.addEventListener("keydown", function (evt) {
        if (evt.code === "ControlLeft" || evt.code === "ControlRight") {
          self.ctrlDown = true;
        }
        if (evt.code === "ShiftLeft" || evt.code === "ShiftRight") {
          self.shiftDown = true;
        }
      });
      document.addEventListener(
        "keyup",
        function (evt) {
          if (!self.selectedElement && !self.selection) return;
          if (evt.code === "Backspace" || evt.code === "Delete") {
            //xóa 1 el

            //xóa toàn bộ  el đã chọn
            if (self.selection.model.length > 0) {
              // chuyeent selection.collection thành mảng hảm remove cell nhận vào 1 mảng và xóa khỏi graph
              let deleteArrId = [];
              self.selection.model.models.forEach((element) => {
               
                deleteArrId.push(element.id);
                self.getNodeAttr(element.id);
              });
              self.$emit("arr-node-delete", deleteArrId);

              evt.preventDefault();
              graph.removeCells(self.selection.collection.toArray());
              self.selection.collection.reset([]);
              self.selectionNode = null;
            } 
            else if (self.selectedElement) {
              if (self.selectedElement.attributes.type === "standard.Link") {
                self.$emit("link-delete", { id: self.selectedElement.id });
              } else {
                self.$emit("node-delete", { id: self.selectedElement.id });
              }
              evt.preventDefault();
              // console.log(self.selectedElement);
              self.selection.collection.add(self.selectedElement)
               graph.removeCells(self.selection.collection.toArray());
               self.selection.collection.reset([]);
              // console.log(self.selectedElement);
              // self.commandManager.undoStack.pop()
              // console.log(self.commandManager.undoStack)
              // self.selectedElement = null;
              // console.log(self.selectedElement);
              self.selectionNode = null;
            }
          }
        },
        false
      );
      //   document.addEventListener('keyup', function (evt) {

      //     if (!self.selectedElement && !self.selection) return;
      //     if (evt.code === 'Backspace' || evt.code === 'Delete') {
      //         //xóa 1 el
      //         console.log(self.selectedElement)
      //         if (self.selectedElement) {
      //             self.selectedElement.remove();
      //             self.selectedElement = null;
      //             self.selectionNode=null;
      //         }
      //         //xóa toàn bộ  el đã chọn
      //         else if (self.selection) {
      //             // chuyeent selection.collection thành mảng hảm remove cell nhận vào 1 mảng và xóa khỏi graph
      //             evt.preventDefault();
      //             graph.removeCells(self.selection.collection.toArray())
      //             self.selectionNode=null;
      //         }
      //     }
      // });
      //nếu thả nút thì =false
      
      document.addEventListener("keyup", function (evt) {
        if (evt.code === "ShiftLeft" || evt.code === "ShiftRight") {
          self.shiftDown = false;
        }
        if (evt.code === "ControlLeft" || evt.code === "ControlRight") {
          self.ctrlDown = false;
        }
      });
      paper.on("cell:pointerup", function (cellView) {
        self.addHaloAndTooltip(cellView);

        if (cellView.model.attributes["type"] === "standard.Link") {
          self.$emit("select-link", { id: cellView.model.id });
        } else {
          self.$emit("select-cell", { id: cellView.model.id });
        }

        self.selectedElement = cellView.model;
        self.selectedElement.toFront({ ignoreCommandManager: true });
        // cellView.$el[0].parentElement.appendChild(cellView.$el[0])
        // console.log(graph.getLinks())
      });

      paper.on({
        //xử lý khi các sự kiện
        "cell:mouseenter": (cellView) => {
          cellView.model.toFront({ ignoreCommandManager: true });
        },
        "cell:mouseleave": (cellView) => {
          cellView.model.toBack({ ignoreCommandManager: true });

          if (self.selectionNode) {
            self
              .getElementPredecessorLinks(self.selectionNode)
              .forEach((link) => {
                link.toFront({ ignoreCommandManager: true });
              });
          }
        },

        "element:pointerclick": (cellView) => {
          //chỉ đổi màu khi ko bấm ctrl
          if (self.ctrlDown === false) {
            self.selectElement(cellView.model);
          }
        },
        "link:mouseenter": (cellView) => {
          cellView.addTools(this.toolsView);
        },
        "link:mouseleave": (cellView) => {
          cellView.hideTools();
        },
        "link:pointerclick": (cellView) => {
          self.selectElement(cellView.model);
          //chon vao link thi mo cho phep doi node
          cellView.addTools(this.toolsView);
        },

        //chuyển lại màu cũ khi bấm ra ngoài
        "blank:pointerclick": () => {
          self.selectElement(null);
          paper.removeTools({ ignoreCommandManager: true });
        },

        "element:pointerup": function (cellView, evt) {
          if (evt.ctrlKey || evt.metaKey) {
            console.log(self.selection);
            self.selection.collection.add(cellView.model);
            //loop to all the element in selection and set it to front
            self.selection.collection.models.forEach((element) => {
              element.toFront({ ignoreCommandManager: true });
            });
          }
        },
        //chuyển màu khi bấm vào link và cho nó lên trc
        "link:pointerup": function (cellView) {
          self.selectedLink = cellView.model;
          self.selectedLink.toFront({ ignoreCommandManager: true });
        },

        // lắng nghe sự kiện bấm ở ngoài khoange trống check shift để active select
        "blank:pointerdown": function (evt, x, y) {
          if (self.shiftDown === true) {
            self.selectElement(null);

            self.paperScroller.setCursor("crosshair");
            self.selection.startSelecting(evt);
          } else {
            self.selection.collection.reset([]);
            self.paperScroller.startPanning(evt, x, y);
            paper.removeTools();
            self.paperScroller.setCursor("grab");
          }
        },
      });
      //xử lý scroll
      
      window.addEventListener("mousewheel", function(e) {
        
        if (e.ctrlKey) {
          e.preventDefault();
          
          if(e.deltaY>0){
            self.paperScroller.zoom(0.2, { max: 4 });
          }
          else if(e.deltaY<0){
             self.paperScroller.zoom(-0.2, { min: 0.2 });
          }
        }
      },{ passive: false });

     
      graph.on("add", (cell, collection, opt) => {
        let type = cell.attributes.type;
        // console.log(type.split('.')[1])
        if (type == "standard.Link") {
          // self.addLinkTools(cell, paper);
          // console.log(cell.attributes.source)
          self.$emit("link-added", {
            source: cell.attributes.source,
            target: cell.attributes.target,
          });
        } else {
          type = type.split(".")[1];
          self.$emit("node-added", {
            id: cell.id,
            type: type,
            prosition: cell.attributes.position,
          });
        }
      });
      graph.on("change:target", function (link) {
        if (link.get("target").id) {
          self.$emit("change-link-target", { id: link.get("target").id });
        }
      });
      //xóa el nếu chọn lại lần 2 khi bấm ctrl
      self.selection.on("selection-box:pointerdown", function (cellView, evt) {
        if (evt.ctrlKey || evt.metaKey) {
          self.selection.collection.remove(cellView.model);
        }
      });
      //kết hợp bấm ctrl để check các tổ hợp phím ctrl + C,V,Z,Y,A...
      document.addEventListener("keydown", function (evt) {
        self.clipboard = new joint.ui.Clipboard();

        if (evt.code === "NumpadAdd" && self.shiftDown === true) {
          // console.log(evt.code)
          self.paperScroller.zoom(0.2, { max: 4 });
        }
        if (evt.code === "NumpadSubtract" && self.shiftDown === true) {
          self.paperScroller.zoom(-0.2, { min: 0.2 });
          // console.log(evt.code)
        }
        //check+ A
        if (evt.code === "KeyA" && self.ctrlDown === true) {
          self.selection.collection.reset(graph.getElements());
          evt.preventDefault();
        } //check ctrl + Z
        if (evt.code === "KeyZ" && self.ctrlDown === true) {
          
          self.commandManager.undo();
          console.log(self.commandManager.redoStack)
          console.log(self.commandManager.undoStack)
          if (self.selectionNode) {
            self.unhighlightCell(self.selectionNode);
            graph.getLinks().forEach((link) => self.unhighlightCell(link));

            // console.log(selectionNode)
            self.selectionNode = null;
          }
        }
        //check ctrl + Y
        if (evt.code === "KeyY" && self.ctrlDown === true) {
          self.commandManager.redo();
          self.selectElement(null);
        }
        //check ctrl + V ,ctrl + C, ctrl+X
        if (evt.code === "KeyX" && self.ctrlDown === true) {
          self.clipboard.cutElements(self.selection.collection, paper.model);
        }
        if (evt.code === "KeyC" && self.ctrlDown === true) {
          self.clipboard.copyElements(self.selection.collection, graph);
        }
        if (evt.code === "KeyV" && self.ctrlDown === true) {
          var pastedCells = self.clipboard.pasteCells(graph, {
            translate: { dx: 40, dy: 40 },
            useLocalStorage: true,
          });

          var elements = _.filter(pastedCells, function (cell) {
            return cell.isElement();
          });
          // Make sure pasted elements get selected immediately. This makes the UX better as
          // the user can immediately manipulate the pasted elements.
          self.selection.collection.reset(elements);
        }
      });
    },
    btnHandler() {
      let self = this;
      $("#btn-zoomin").on("click", function () {
        self.paperScroller.zoom(0.2, { max: 4 });
      });
      $("#btn-zoomout").on("click", function () {
        self.paperScroller.zoom(-0.2, { min: 0.2 });
      });
      $("#btn-center").on(
        "click",
        _.bind(self.paperScroller.center, self.paperScroller)
      );
      $("#btn-center-content").on(
        "click",
        _.bind(self.paperScroller.centerContent, self.paperScroller)
      );
    },

    getAllLinks() {
      return this.graph.getLinks();
    },
    getAllNodes() {
      return this.graph.getCells();
    },
    clearAll() {
      return this.graph.clear();
    },
    getNodeAttr(id) {
      let node = this.graph.getCell(id);
      if (node) {
        return node.attributes;
      } else {
        return {};
      }
    },
    render() {
      let nodeInfos = this.nodes;
      let linkInfos = this.links;
      nodeInfos.forEach((nodeInfo) => {
        let nodeType = nodeInfo.type;
        let elementName = this.jsUcfirst(nodeInfo.name);
        //checknode
        if (nodeType === "Rectangle") {
          if (elementName === "Load") {
            let cell = new this.customElNoInPorts({
              position: nodeInfo.position,
              id: nodeInfo.id,
            });
            cell.prop(
              "attrs/image/xlinkHref",
              require(`../assets/${elementName}.svg`)
            );
            this.graph.addCell(cell);
            // console.log(cell)
            // linkInfo.source=cell
          } else {
            let cell = new this.customEl({
              position: nodeInfo.position,
              id: nodeInfo.id,
            });
            cell.prop(
              "attrs/image/xlinkHref",
              require(`../assets/${elementName}.svg`)
            );
            this.graph.addCell(cell);
            //   linkInfo.target=cell
            // console.log(cell)
          }
        } else {
          console.error("Node type '" + nodeType + "' is not defined");
        }
      });

      if (linkInfos) {
        linkInfos.forEach((linkInfo) => {
          let link = new joint.shapes.standard.Link({
            attrs: {
              z: 1,
              line: {
                connection: true,
                stroke: "#707070",
                strokeWidth: 3,
                strokeLinejoin: "round",
                targetMarker: {
                  type: "path",

                  d: "M 10 -5 0 0 10 5 Z",
                },
              },
              wrapper: {
                connection: true,
                strokeWidth: 6,
                strokeLinejoin: "round",
              },
            },

            markup: [
              {
                tagName: "path",
                selector: "wrapper",
                attributes: {
                  fill: "none",

                  stroke: "transparent",
                },
              },
              {
                tagName: "path",
                selector: "line",
                attributes: {
                  fill: "none",
                },
              },
            ],
          });

          link.source(this.getNodeAttr(linkInfo.source));
          link.target(this.getNodeAttr(linkInfo.target));
          link.addTo(this.graph);
        });
      }
    },
  },
};
</script>

<style>
.joint-element .selection {
  stroke: rgb(255 136 0);
}
.joint-link .selection {
  stroke: rgb(255 136 0);
  /* fill: rgb(255 136 0); */
}
/* .joint-paper-scroller.joint-theme-default {
  width: 800px !important;
  height: 600px;
}
.joint-toolbar.joint-theme-default {
  width: 800px !important;
} */
.joint-halo.joint-theme-default.toolbar.type-element .handle.remove {
  position: relative !important;
  right: 0 !important;
}
.joint-halo.joint-theme-default.toolbar .handles:after {
  left: 12px !important;
}
.joint-halo.joint-theme-default.toolbar .handles {
  margin-left: 5px !important;
}
.joint-paper-background,
.joint-paper-grid,
.joint-paper > svg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.joint-selection.joint-theme-material .handle.remove {
  position: static;
  display: inline-block;
  vertical-align: top;
  white-space: nowrap;
  background-color: #fff;
  border: 1px solid #d3d3d3;
  border-bottom: 4px solid #000;
  width: 20px;
  margin-top: -50px;
  margin-left: 54px;
}
div.handle.nw.remove:before {
  content: "";

  position: absolute;
  vertical-align: top;

  margin-top: 22px;

  border-top: 6px solid #000;
  border-right: 10px solid transparent;
  border-left: 8px solid transparent;
  /* width: 2px; */
}
.joint-paper-scroller.joint-theme-default{
  width:100% !important;
  
}
.joint-paper-scroller {
    position: relative;
    overflow: scroll;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
}
.joint-selection.joint-theme-material .handle.remove:after {
  /* font-family: selection-icons-dark;
  font-style: normal;
  font-weight: 400;
  speak: none;
  display: inline-block;
  text-decoration: inherit;
  margin: auto;
  text-align: center;
  font-variant: normal;
  text-transform: none;
  font-size: 18px;
  color: #5faaee; */
}
</style>