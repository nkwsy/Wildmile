export default function PlantEdit() {
  const { opened, open, close } = useDisclosure(false);

  const [plants, setPlants] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState(null);

  const form = useForm({
    initialValues: {
      _id: "",
      scientific_name: "",
      common_name: "",
      notes: "",
      image_url: "",
    },
  });

  useEffect(() => {
    const fetchPlants = async () => {
      const fetchedPlants = await PlantHandler();
      setPlants(JSON.parse(fetchedPlants.plants) || []);
    };

    fetchPlants();
  }, []);

  const updateFormValues = (plant) => {
    form.setValues({
      _id: plant._id,
      scientific_name: plant.scientific_name || plant.scientificName,
      common_name: plant.common_name || plant.commonName,
      image_url: plant.image_url || plant.botanicPhoto,
      notes: plant.notes,
    });
    setSelectedPlant(plant);
    open();
  };

  async function updatePlant(e) {
    e.preventDefault();
    let body = form.values;
    const id = body._id;

    try {
      const res = await fetch(`/api/plants/editPlant/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Plant updated:", data);
      close();
    } catch (error) {
      console.error("Failed to update plant:", error);
      // You might want to show an error notification here
    }
  }
  return (
    <Modal opened={opened} onClose={close} title="Edit Plant" centered>
      <form onSubmit={updatePlant}>
        <TextInput
          label="Scientific Name"
          {...form.getInputProps("scientific_name")}
        />
        <TextInput label="Common Name" {...form.getInputProps("common_name")} />
        <TextInput label="Image URL" {...form.getInputProps("image_url")} />
        <Textarea label="Notes" {...form.getInputProps("notes")} />
        <Button fullWidth mt="xl" type="submit">
          Update
        </Button>
      </form>
      {selectedPlant && (
        <Image
          radius="md"
          height={200}
          width="auto"
          fit="contain"
          src={selectedPlant.image_url || "/No_plant_image.jpg"}
          alt={selectedPlant.common_name || selectedPlant.scientific_name}
        />
      )}
    </Modal>
  );
}
