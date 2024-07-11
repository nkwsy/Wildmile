import {
  Title,
  Paper,
  Textarea,
  NumberInput,
  Select,
  Button,
  Group,
  Container,
  SimpleGrid,
  rem,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../../../lib/hooks";
import dbConnect from "../../../../lib/db/setup";
import Module from "../../../../models/Module";
import IndividualPlant from "../../../../models/IndividualPlant";
import Plant from "../../../../models/Plant";

// To do any drawing on canvas we have to make things client side only by doing this
import dynamic from "next/dynamic";

const ModuleRenderer = dynamic(() => import("../../../../components/module"), {
  ssr: false,
});

export default function ProjectSectionLanding(props) {
  const router = useRouter();
  const { user, loading }  = useUser();

  const form = useForm({
    initialValues: {
      x: props.module.x,
      y: props.module.y,
      model: props.module.model,
      shape: props.module.shape,
      orientation: props.module.orientation,
      tags: props.module.tags,
      notes: props.module.notes,
    },

    validate: {},
  });

  console.log(props.plants);

  const plant_locations = props.module.plants.map((plant) => {
    console.log(plant.plant);
    return (
      <Paper key={`${plant.x}-${plant.y}`}>
        <Title>{`${plant.x}-${plant.y}`}</Title>
        {props.plants[plant.plant].common_name ||
          props.plants[plant.plant].scientific_name ||
          props.plants[plant.plant].scientificName}
      </Paper>
    );
  });

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) router.replace("/");
  }, [user, loading]);

  return (
    <>
      <Container maw="85%" my="5rem">
        <Title
          order={2}
          ta="center"
          mt="sm"
        >{`${router.query.id} Module ${router.query.mid}`}</Title>
        <Paper withBorder shadow="md" mt="lg" p={30} radius="md">
          <ModuleRenderer width={800} height={400} />
        </Paper>
        <Group position="apart" mt="lg">
          <Paper maw="25%" withBorder shadow="md" p={30} radius="md">
            <form
              onSubmit={form.onSubmit((values) => {
                console.log(values);
              })}
            >
              <NumberInput
                label="X:"
                defaultValue={0}
                {...form.getInputProps("x")}
              />
              <NumberInput
                label="Y:"
                defaultValue={0}
                {...form.getInputProps("y")}
              />
              <Select
                label="Model"
                placeholder="Pick one"
                data={[
                  { value: "3-d", label: "3-D" },
                  { value: "4-d", label: "4-D" },
                  { value: "5-d", label: "5-D" },
                  { value: "Dock-20 foot", label: "Dock-20 foot" },
                  {
                    value: "Dock-20 foot angled",
                    label: "Dock-20 foot angled",
                  },
                  { value: "Dock-24 foot", label: "Dock-24 foot" },
                ]}
                {...form.getInputProps("model")}
              />
              <Select
                label="Shape"
                placeholder="Pick one"
                data={[
                  { value: "R3", label: "R3" },
                  { value: "R2.3", label: "R2.3" },
                  { value: "T3", label: "T3" },
                  { value: "T2.3", label: "T2.3" },
                ]}
                {...form.getInputProps("shape")}
              />
              <Select
                label="Angled Orientation"
                placeholder="Pick one"
                data={[
                  { value: "flat", label: "Flat" },
                  { value: "RH", label: "RH" },
                  { value: "LH", label: "LH" },
                ]}
                {...form.getInputProps("orientation")}
              />
              {/* Tags: {props.module.tags.map((tag) => {return tag})} */}
              <Textarea label="Notes" {...form.getInputProps("notes")} />
              <Button mt="xl" type="submit">
                Update Module
              </Button>
            </form>
          </Paper>
          <Paper maw="66%" withBorder shadow="md" p={30} radius="md">
            <SimpleGrid mt={40} cols={10}>
              {plant_locations}
            </SimpleGrid>
          </Paper>
        </Group>
      </Container>
    </>
  );
}

/* Retrieves plant(s) data from mongodb database */
export async function getServerSideProps(context) {
  const module_id = context.params.mid;
  await dbConnect();

  const result = await Module.findOne({ _id: module_id });
  const module = result.toObject();
  module._id = String(module._id);
  module.section = String(module.section);

  const module_plant_query = await IndividualPlant.find({ module: module_id }, [
    "-createdAt",
    "-updatedAt",
    "-module",
  ]).sort("x");

  const module_plants = module_plant_query.map((doc) => {
    const plant = doc.toObject();
    plant._id = String(plant._id);
    plant.plant = String(plant.plant);
    return plant;
  });

  module_plants.sort((a, b) => {
    if (a.y < b.y) {
      return -1;
    }
    if (a.y > b.y) {
      return 1;
    }

    // names must be equal
    return 0;
  });

  module.plants = module_plants;

  const all_plants = await Plant.find({}, ["-createdAt", "-updatedAt"]);

  const plants_unmapped = all_plants.map((doc) => {
    const plant = doc.toObject();
    plant._id = String(plant._id);
    return plant;
  });

  const plants = plants_unmapped.reduce(
    (obj, item) => ((obj[item._id] = item), obj),
    {}
  );

  return { props: { module: module, plants: plants } };
}
