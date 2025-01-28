import mongoose from "mongoose";

const PhotoSchema = new mongoose.Schema(
  {
    license_code: String,
    attribution: String,
    url: String,
    tags: { type: Array, default: [] },
    description: String,
    quality: { type: Number, min: 1, max: 5, default: 3 },
    original: { type: Boolean, default: false },
    original_dimensions: {
      height: Number,
      width: Number,
    },
    flags: [String],
    square_url: String,
    medium_url: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add photo aliases
PhotoSchema.virtual("image").get(function () {
  return this.medium_url;
});
PhotoSchema.virtual("thumbnail").get(function () {
  return this.square_url;
});

const SpeciesSchema = new mongoose.Schema(
  {
    taxonId: {
      type: Number,
      unique: true,
      required: true,
      alias: "id", // 'id' can be used instead of 'iNatId'
    },
    rank: {
      type: String,
      required: true,
    },
    rank_level: Number,
    iconic_taxon_id: Number,
    ancestor_ids: [Number],
    is_active: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      alias: "scientificName", // 'scientificName' can be used instead of 'name'
    },
    common_name: {
      type: String,
      alias: "commonName", // 'commonName' can be used instead of 'common_name'
    },
    parent_id: Number,
    ancestry: String,
    extinct: {
      type: Boolean,
      default: false,
    },
    default_photo: {
      type: PhotoSchema,
      alias: "images", // 'images' can be used instead of 'default_photo'
    },
    photos: [PhotoSchema],

    wikipedia_url: {
      type: String,
      alias: "wiki", // 'wiki' can be used instead of 'wikipedia_url'
    },
    complete_rank: String,
    iconic_taxon_name: {
      type: String,
      alias: "family", // 'family' can be used instead of 'iconic_taxon_name'
    },
    preferred_common_name: {
      type: String,
      alias: "commonName", // 'commonName' can be used instead of 'preferred_common_name'
    },
    // conservation_status: String,
    // Additional fields
    lastObserved: Date,
    observationCount: {
      type: Number,
      default: 0,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, aliases: true },
    toObject: { virtuals: true, aliases: true },
  }
);

// Add additional virtual properties
SpeciesSchema.virtual("title").get(function () {
  return this.preferred_common_name || this.name;
});

SpeciesSchema.virtual("subtitle").get(function () {
  return this.name;
});

// Indexes
SpeciesSchema.index({ name: 1, common_name: 1, taxonId: 1 });

// Helper method to format for SpeciesCard
SpeciesSchema.methods.toCardFormat = function () {
  return {
    id: this.taxonId,
    title: this.title,
    subtitle: this.subtitle,
    image: this.default_photo?.medium_url || "/No_plant_image.jpg",
    description: this.rank,
    family: this.iconic_taxon_name,
    wiki: this.wikipedia_url,
    inat_result: this.toObject(),
  };
};

// Add after the toCardFormat method and before the export
SpeciesSchema.statics.findOrFetchByName = async function (speciesName) {
  try {
    // First try to find in our database
    let species = await this.findOne({
      $or: [
        { name: new RegExp(speciesName, "i") },
        { preferred_common_name: new RegExp(speciesName, "i") },
      ],
    });

    // If found, return it
    if (species) {
      return species;
    }

    // If not found, fetch from iNaturalist API
    const response = await fetch(
      `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(
        speciesName
      )}&limit=1`,
      { next: { revalidate: 360000 } } // Cache for 10 hours
    );

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log("No results found for", speciesName);
      return null;
    }

    const iNatSpecies = data.results[0];

    // Transform iNaturalist data to match our schema
    const speciesData = {
      taxonId: iNatSpecies.id,
      rank: iNatSpecies.rank,
      rank_level: iNatSpecies.rank_level,
      iconic_taxon_id: iNatSpecies.iconic_taxon_id,
      ancestor_ids: iNatSpecies.ancestor_ids,
      name: iNatSpecies.name,
      parent_id: iNatSpecies.parent_id,
      ancestry: iNatSpecies.ancestry,
      observations_count: iNatSpecies.observations_count,
      wikipedia_url: iNatSpecies.wikipedia_url,
      complete_rank: iNatSpecies.complete_rank,
      iconic_taxon_name: iNatSpecies.iconic_taxon_name,
      preferred_common_name: iNatSpecies.preferred_common_name,
      default_photo: iNatSpecies.default_photo
        ? {
            id: iNatSpecies.default_photo.id,
            license_code: iNatSpecies.default_photo.license_code,
            attribution: iNatSpecies.default_photo.attribution,
            url: iNatSpecies.default_photo.url,
            original_dimensions: iNatSpecies.default_photo.original_dimensions,
            square_url: iNatSpecies.default_photo.square_url,
            medium_url: iNatSpecies.default_photo.medium_url,
          }
        : null,
    };
    // Create and save the new species
    species = await this.create(speciesData);
    return species;
  } catch (error) {
    console.error("Error in findOrFetchByName:", error);
    throw error;
  }
};

// Add method to update multiple species at once
SpeciesSchema.statics.findOrFetchMany = async function (speciesNames) {
  try {
    const speciesPromises = speciesNames.map((name) =>
      this.findOrFetchByName(name)
    );
    return await Promise.all(speciesPromises);
  } catch (error) {
    console.error("Error in findOrFetchMany:", error);
    throw error;
  }
};

export default mongoose.models.Species ||
  mongoose.model("Species", SpeciesSchema);
