(async () => {
  const data = await fetch('/data/points.json').then(r => r.json());

  const svg = d3.select('#svg');
  const width = 1000, height = 640;
  const m = { top:24, right:24, bottom:52, left:60 };
  const iw = width - m.left - m.right, ih = height - m.top - m.bottom;

  const x = d3.scaleLinear().domain(d3.extent(data, d => d.x)).nice().range([m.left, m.left + iw]);
  const y = d3.scaleLinear().domain(d3.extent(data, d => d.y)).nice().range([m.top + ih, m.top]);

  svg.append('g').attr('transform', `translate(0,${m.top + ih})`).call(d3.axisBottom(x));
  svg.append('g').attr('transform', `translate(${m.left},0)`).call(d3.axisLeft(y));

  const tip = d3.select('body').append('div').attr('class', 'tooltip');
  const tipImg = tip.append('img');
  const tipCap = tip.append('div').attr('class', 'cap');

  svg.append('g').selectAll('circle').data(data).join('circle')
    .attr('class', 'dot').attr('r', 6)
    .attr('cx', d => x(d.x)).attr('cy', d => y(d.y))
    .on('mouseenter', (_, d) => { tipImg.attr('src', d.img); tipCap.text(d.label || ''); tip.style('display', 'block'); })
    .on('mousemove', e => tip.style('left', (e.clientX + 12) + 'px').style('top', (e.clientY + 12) + 'px'))
    .on('mouseleave', () => tip.style('display', 'none'));
})();
