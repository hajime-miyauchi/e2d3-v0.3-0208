/**
サンプル用main.js
Window幅は、グローバル変数 windowSize を使用することができます
*/


var metrics = 'stop_lat';

// サイズの定義
var maxHeight = 400;
var maxWidth = 600;
    var leftMargin = 50;
    var topMargin = 50;
    var bottomMargin = 50;
    
    // 描画領域のサイズを設定
    var height = maxHeight - topMargin - bottomMargin
    var width = maxWidth - leftMargin
    
// svgを追加
drawArea = d3.select('#e2d3-chart-area').append('svg')
        .attr('width', maxWidth)
        .attr('height', maxHeight)
        .append('g')
        .attr('transform', 'translate(' + leftMargin + ',' + topMargin + ')')
        

//Excelにデータがセットされた後、最初に呼ばれるメソッド（必須）
function e2d3Show(isUpdated) {
    if(isUpdated){
        e2d3.bind2Json(e2d3BindId, { dimension: '2d' }, show);
    }else{
    //Excel上でのデータ変更イベントを補足（この場合はe2d3Updateメソッドをコールバックに指定）
    //"e2d3BindId"はグローバルな変数です
      e2d3.addChangeEvent(e2d3BindId, e2d3Update, function () {

           //Excel上のバインド範囲のデータをjsonに変換（必須）。(この場合コールバックにshowメソッドを指定)
           e2d3.bind2Json(e2d3BindId, { dimension: '2d', is_formatted: true }, show);
       });
    }
}
//データ変更時のコールバック用メソッド（必須）
function e2d3Update(responce) {
    console.log("e2d3Update :" + responce);
    e2d3Show(responce);
}

//変換されたjsonデータを使ってグラフ描画
function show(data) {
    //dataは、bind2jsonで渡すdimensionオプションによって、整形されたJsonオブジェクトです。
    //描画は、#e2d3-chart-area 内にしてください。
    
    console.log(data);
    
    var projection = d3.geo.mercator();

    drawArea.selectAll(".pin")
    .data(data)
    .enter().append("circle", ".pin")
    .attr("r", 3)
    .attr("transform", function(d) {
      return "translate(" + projection([d.stop_lon, d.stop_lat]) + ")"
    });

    // 最大値の取得
    var yMax = d3.max(data, function (d) { return parseInt(d[metrics], 10) + 1})
    // 最小値の取得
    var yMin = d3.min(data, function (d) { return d[metrics]})

    // xのスケールの設定
    var xScale = d3.scale.ordinal()
                    .rangeRoundBands([0, width], .1);

    // yのスケールの設定
    var yScale = d3.scale.linear()
                    .domain([yMin, yMax])
                    .range([height, 0]);

    // xの軸の設定
    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom");

    // yの軸の設定
    var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient('left');

    
    // x軸をsvgに表示
    drawArea.selectAll("g").remove();
    drawArea
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - 1)+ ")")
        .call(xAxis);

    // y軸をsvgに表示
    drawArea
        .append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        
    // バーの描画
    drawArea.selectAll("rect").remove();
    drawArea
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .on('click', function (d) {
            alert(metrics + d[metrics])
        })
        .on('mouseover', function (d) {
            d3.select(this)
                .attr('fill', 'orange')
        })
        .on('mouseout', function (d) {
            d3.select(this)
                .attr('fill', 'red');
        })
        .attr('fill', '#f00')
        .attr('height', 0)
        .attr('width', 10)
        .attr('y', height)
        .attr('x', function (d, i) {
            return i * 15;
        })
        .transition()
        .duration(1000)
        .delay(function(d, i) {
            return  i * 20;
        })
        .ease('bounce')
        .attr('y', function (d) {
            return yScale(d[metrics])
        })
        .attr('height', function (d) {
            return height - yScale(d[metrics]);
        });
}
