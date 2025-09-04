// Dot plot with categorical x-axis (10 fonts) + tick thumbnails + hover preview
(async () => {
  const data = await fetch('/data/points.json').then(r => r.json());
  // data: { font: "Font Name", y: <number>, img: "/images/xxx.webp", label?: string }

  const svg = d3.select('#svg');
  const width = 1000, height = 640;

  // Extra bottom margin for thumbnails + labels
  const m = { top: 24, right: 24, bottom: 150, left: 60 };
  const iw = width - m.left - m.right, ih = height - m.top - m.bottom;

  // X = font names (categorical)
  const fonts = data.map(d => d.font);
  const x = d3.scalePoint().domain(fonts).range([m.left, m.left + iw]).padding(0.5);

  // Y = numeric metric (you can change units/scale later)
  const y = d3.scaleLinear()
    .domain([0, Math.max(1, d3.max(data, d => d.y))]).nice()
    .range([m.top + ih, m.top]);

  // Axes
  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(0,${m.top + ih})`)
    .call(d3.axisBottom(x).tickSizeOuter(0).tickFormat(() => "")); // hide tick text (we draw our own labels)

  svg.append('g')
    .attr('class', 'axis')
    .attr('transform', `translate(${m.left},0)`)
    .call(d3.axisLeft(y).ticks(6).tickSizeOuter(0));

  // Horizontal grid
  svg.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(${m.left},0)`)
    .call(d3.axisLeft(y).ticks(6).tickSize(-iw).tickFormat(''));

  // Thumbnails under each tick
  const thumb = 44;
  const thumbGap = 26;        // gap below axis to thumbs
  const thumbsY = m.top + ih + thumbGap;

  svg.append('g')
    .attr('aria-label', 'x-axis thumbnails')
    .selectAll('image')
    .data(data, d => d.font)
    .join('image')
      .attr('href', d => d.img)
      .attr('width', thumb)
      .attr('height', thumb)
      .attr('x', d => (x(d.font) ?? 0) - thumb / 2)
      .attr('y', thumbsY)
      .attr('preserveAspectRatio', 'xMidYMid slice')
    .append('title')
      .text(d => d.font);

  // Font name labels under thumbnails
  svg.append('g')
    .attr('aria-label', 'x-axis labels')
    .selectAll('text')
    .data(data, d => d.font)
    .join('text')
      .attr('x', d => x(d.font))
      .attr('y', thumbsY + thumb + 16)
      .attr('fill', '#cdd7f6')
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .text(d => d.font);

  // Tooltip (big preview on hover)
  const tip = d3.select('body').append('div').attr('class', 'tooltip').style('display', 'none');
  const tipImg = tip.append('img');
  const tipCap = tip.append('div').attr('class', 'cap');

  // Dots
  svg.append('g')
    .attr('aria-label', 'points')
    .selectAll('circle')
    .data(data)
    .join('circle')
      .attr('class', 'dot')
      .attr('r', 6)
      .attr('cx', d => x(d.font))
      .attr('cy', d => y(d.y))
      .on('mouseenter', (_, d) => {
        tipImg.attr('src', d.img);
        tipCap.text(d.label || d.font || '');
        tip.style('display', 'block');
      })
      .on('mousemove', e => {
        const W = Math.min(360, Math.floor(window.innerWidth * 0.6));
        const H = 260;
        const px = Math.min(e.clientX + 16, window.innerWidth - W - 12);
        const py = Math.min(e.clientY + 16, window.innerHeight - H - 12);
        tip.style('left', px + 'px').style('top', py + 'px');
      })
      .on('mouseleave', () => tip.style('display', 'none'));
})();
