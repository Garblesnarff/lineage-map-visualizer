import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { LineageData } from "@/types/lineage";

interface LineageScatterPlotProps {
  data: LineageData[];
  onLineageSelect: (lineage: LineageData) => void;
}

export const LineageScatterPlot = ({ data, onLineageSelect }: LineageScatterPlotProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    // Clear previous content
    svg.selectAll("*").remove();

    // Create scales
    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.x) || 0, d3.max(data, d => d.x) || 0])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.y) || 0, d3.max(data, d => d.y) || 0])
      .range([height - margin.bottom, margin.top]);

    // Create color scale for scholastic scores
    const colorScale = d3.scaleSequential()
      .domain([0, 10]) // Assuming scholastic scores are between 0 and 10
      .interpolator(d3.interpolateRdBu);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .attr("color", "#9ca3af");

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale))
      .attr("color", "#9ca3af");

    // Add dots
    svg.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 6)
      .attr("fill", d => colorScale(d.scholastic || 0))
      .attr("opacity", 0.7)
      .attr("cursor", "pointer")
      .on("mouseover", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 8)
          .attr("opacity", 1);
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 6)
          .attr("opacity", 0.7);
      })
      .on("click", (event, d) => onLineageSelect(d));

  }, [data, onLineageSelect]);

  return (
    <div className="w-full bg-gray-900 rounded-lg p-4">
      <svg
        ref={svgRef}
        className="w-full"
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
};