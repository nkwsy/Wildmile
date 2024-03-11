// components/LocationModal.js
import { Modal } from "@mantine/core";
import LocationMap from "./LocationMap";

const LocationModal = ({ opened, setOpened, setLocation }) => {
  const handleLocationSelect = (location) => {
    setLocation(location);
    setOpened(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title="Select a Location"
      size="lg"
    >
      <LocationMap onLocationSelect={handleLocationSelect} />
    </Modal>
  );
};

export default LocationModal;
