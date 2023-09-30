import { Stage, Layer, Circle, Rect } from "react-konva";

function Test(props) {
  return (
    <Stage width={props.width} height={props.height}>
      <Layer>
        <Rect x={0} y={0} width={props.width} height={props.height} fill="#ccc"/>
        <Circle x={200} y={100} radius={50} fill="green" />
      </Layer>
    </Stage>
  );
}

export default Test;