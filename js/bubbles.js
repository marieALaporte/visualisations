function printBubbles(){
   var d3_category20 = ["#3182bd",
"#6baed6",
"#9ecae1",
"#c6dbef",
"#e6550d",
"#fd8d3c",
"#fdae6b",
"#fdd0a2",
"#31a354",
"#74c476",
"#a1d99b",
"#c7e9c0",
"#756bb1",
"#9e9ac8",
"#bcbddc",
"#dadaeb",
"#636363",
"#969696",
"#bdbdbd",
"#d9d9d9",
"#FFFF00", "#1CE6FF", "#FF34FF", "#FF4A46", "#008941"];
  var diameter = 960,
      format = d3.format(",d"),
      color = d3.scaleOrdinal(d3.schemeCategory20c);
      console.log(d3.schemeCategory20c);
  var bubble = d3.pack()
      .size([diameter, diameter])
      .padding(1.5);

  var svg = d3.select("#test").append("svg")
      .attr("width", diameter)
      .attr("height", diameter)
      .attr("class", "bubble");

  d3.json("data/graphDnd.json", function(error, treeData) {
    if (error) throw error;

    var duplicatedNodes = "";
    var count = 0;
    // create a name: node map
    var dataMap = treeData.reduce(function(map, node) {
        if(map[node.name]){
            duplicatedNodes=duplicatedNodes+node.name+"|";
            count++;
        }
        map[node.name] = node;
        return map;
    }, {});
    console.log(duplicatedNodes);
    console.log(count);
    // create the tree array
    var tree = {};
    treeData.forEach(function(node) {
        // add to parent
        var parent = dataMap[node.parent];
        if (parent) {
            // create child array if it doesn't exist
            (parent.children || (parent.children = []))
                // add node to child array
                .push(node);
        } else {
            // parent is null or missing
            //tree.push(node);
            tree.name=node.name;tree.children=node.children;tree.value=node.value;
        }
    });

    var data = tree;
    console.log(data);
    
    var root = d3.hierarchy(classes(data))
        .sum(function(d) { return d.value; })
        .sort(function(a, b) { return b.value - a.value; });

    bubble(root);
    console.log(root);

    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("color", "white")
        .style("padding", "8px")
        .style("background-color", "rgba(0, 0, 0, 0.75)")
        .style("border-radius", "6px")
        .style("font", "12px sans-serif")
        .text("tooltip");

    var node = svg.selectAll(".node")
        .data(root.children)
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("title")
        .text(function(d) { return d.data.className + ": " + format(d.value); });

    node.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { 
          return color(d.data.packageName); 
        })
        .on("mouseover", function(d) {
              tooltip.text(d.data.className + ": " + format(d.value));
              tooltip.style("visibility", "visible");
        })
        .on("mousemove", function() {
            return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
        })
        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});;

    node.append("text")
        .attr("dy", ".3em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.className.substring(0, d.r / 3); });
  });

  // Returns a flattened hierarchy containing all leaf nodes under the root.
  function classes(root) {
    var classes = [];

    function recurse(name, node) {
      if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
      else classes.push({packageName: name, className: node.name, value: node.value});
    }

    recurse(null, root);
    return {children: classes};
  }

  d3.select(self.frameElement).style("height", diameter + "px");
}