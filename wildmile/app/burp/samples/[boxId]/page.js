import CreateLog from "./new";

export default function Page({ params }) {
  if (params.boxId) {
    if (params.boxId === "new") {
      return <CreateLog />;
      console.log("New box");
    }
    console.log("BoxId:", params.boxId);
  }
  return (
    <div>
      <h1>BoxId</h1>
    </div>
  );
}
