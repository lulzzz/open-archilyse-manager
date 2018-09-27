/**
 * Displays the legend in a given coordinate
 * @param left
 * @param top
 * @param text
 * @private
 */
export function showLegend(left, top, text) {
  const legend = document.getElementById('floorplanLegend');
  legend.innerHTML = text;
  legend.style.visibility = 'visible';
  legend.style.left = left + 'px';
  legend.style.top = top + 'px';
}

/**
 * Hides the legend
 * @private
 */
export function hideLegend() {
  const legend = document.getElementById('floorplanLegend');
  legend.style.visibility = 'hidden';
}
