# Cameratrap Schema Reference

All models use Mongoose (MongoDB ODM). Every document automatically receives an `_id` (ObjectId) primary key and `createdAt`/`updatedAt` timestamps unless noted otherwise.

---

## Relationships Overview

```
DeploymentLocation 1──* Deployment *──1 Camera
                             │
                             │ 1
                             ▼ *
                           Media
                             │
                             │ 1
                             ▼ *
                         Observation
```

- A **Camera** is placed at a **DeploymentLocation** via a **Deployment**.
- Each **Deployment** produces many **Media** (images/video).
- Each **Media** can have many **Observations** (species annotations).

---

## 1. Camera

**Collection:** `cameras`
**Mongoose model name:** `Camera`

| Field | Type | Required | Default | Constraints / Notes |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Primary key |
| `name` | String | **yes** | — | Human-readable camera label |
| `serial` | String | no | — | Serial number |
| `purchaseDate` | Date | no | — | |
| `connectivity` | String | no | — | e.g. "WiFi", "Wired Ethernet" |
| `notes` | String | no | — | |
| `comments` | [String] | no | — | Array of comment strings |
| `model` | String | **yes** | — | Stored lowercase |
| `manufacturer` | String | no | — | Stored lowercase |
| `resolution` | String | no | — | e.g. "1920x1080" |
| `features.nightVision` | Boolean | no | `false` | |
| `features.motionDetection` | Boolean | no | `false` | |
| `features.waterproof` | Boolean | no | `false` | |
| `features.storageType` | String | no | — | e.g. "Cloud", "SD card" |
| `features.storageCapacity` | String | no | — | e.g. "32GB", "64GB" |
| `features.video` | Boolean | no | `false` | |
| `features.audio` | Boolean | no | `false` | |
| `features.timeLapse` | Boolean | no | `false` | |
| `installationDate` | Date | no | `Date.now` | |
| `instructionManual` | String | no | — | |
| `location` | String | no | — | Free-text location label |
| `creator` | ObjectId | no | — | Ref → `User` |
| `createdAt` | Date | auto | — | Mongoose timestamp |
| `updatedAt` | Date | auto | — | Mongoose timestamp |

---

## 2. DeploymentLocation

**Collection:** `deploymentlocations`
**Mongoose model name:** `DeploymentLocation`

| Field | Type | Required | Default | Constraints / Notes |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Primary key |
| `locationName` | String | **yes** | — | |
| `zone` | String | no | — | |
| `projectArea` | String | no | — | |
| `location` | **Point** (subdoc) | no | — | GeoJSON Point (see below) |
| `tags` | [String] | no | — | |
| `mount` | String | no | — | |
| `favorite` | Boolean | no | — | |
| `notes` | String | no | — | |
| `image` | String | no | — | |
| `retired` | Boolean | no | — | |
| `creator` | ObjectId | no | — | Ref → `User` |
| `createdAt` | Date | auto | — | Mongoose timestamp |
| `updatedAt` | Date | auto | — | Mongoose timestamp |

**Virtuals:**
- `deployments` — populated array of `CameratrapDeployment` docs where `locationId` matches this `_id`.
- `isActive` — `true` if any linked deployment has no `deploymentEnd`.

---

## 3. Deployment

**Collection:** `cameratrapdeployments`
**Mongoose model name:** `CameratrapDeployment`

| Field | Type | Required | Default | Constraints / Notes |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Primary key |
| `cameraId` | ObjectId | **yes** | — | Ref → `Camera` |
| `locationId` | ObjectId | no | — | Ref → `DeploymentLocation` |
| `locationName` | String | no | — | Free-text fallback |
| `location` | **Point** (subdoc) | no | — | GeoJSON Point (see below) |
| `coordinateUncertainty` | Number | no | — | min: 1 (meters) |
| `deploymentStart` | Date | **yes** | — | |
| `deploymentEnd` | Date | no | — | Null means still active |
| `setupBy` | String | no | — | |
| `cameraDelay` | Number | no | — | min: 0 (seconds) |
| `cameraHeight` | Number | no | — | min: 0 (meters) |
| `cameraDepth` | Number | no | — | min: 0 |
| `cameraTilt` | Number | no | — | min: -90, max: 90 (degrees) |
| `cameraHeading` | Number | no | — | min: 0, max: 360 (degrees) |
| `detectionDistance` | Number | no | — | min: 0 (meters) |
| `timestampIssues` | Boolean | no | — | Flag for known clock problems |
| `baitUse` | Boolean | no | — | |
| `featureType` | String | no | — | |
| `habitat` | String | no | — | |
| `deploymentGroups` | String | no | — | |
| `deploymentTags` | [String] | no | — | |
| `deploymentComments` | String | no | — | |
| `creator` | ObjectId | no | — | Ref → `User` |
| `createdAt` | Date | auto | — | Mongoose timestamp |
| `updatedAt` | Date | auto | — | Mongoose timestamp |

**Virtuals:**
- `mediaCount` — count of `CameratrapMedia` docs where `deploymentId` matches this `_id`.
- `observationCount` — count of `Observation` docs where `deploymentId` matches this `_id`.

---

## 4. Media

**Collection:** `cameratrapmedias`
**Mongoose model name:** `CameratrapMedia`

| Field | Type | Required | Default | Constraints / Notes |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Primary key |
| `mediaID` | String | **yes** | — | **Unique.** MD5 hash generated by AWS |
| `imageHash` | String | no | — | Hash of image without EXIF data |
| `deploymentId` | ObjectId | no | — | Ref → `Deployment` |
| `timestamp` | Date | **yes** | — | Pre-save hook defaults invalid dates to `Date.now` |
| `publicURL` | String | no | — | |
| `relativePath` | [String] | no | — | Indexed for querying |
| `filePath` | String | no | — | |
| `filePublic` | Boolean | no | — | |
| `fileName` | String | no | — | |
| `fileMediatype` | String | no | — | MIME type |
| `fileLocations` | [**FileLocation**] | no | — | Array of subdocs (see below) |
| `exifData` | Mixed | no | — | Free-form EXIF metadata |
| `aiResults` | [**AiResult**] | no | — | Array of subdocs (see below) |
| `favorite` | Boolean | no | `false` | |
| `favoriteCount` | Number | no | `0` | |
| `favorites` | [ObjectId] | no | — | Refs → `User` |
| `mediaComments` | [**MediaComment**] | no | — | Array of subdocs (see below) |
| `reviewed` | Boolean | no | `false` | |
| `accepted` | Boolean | no | `false` | |
| `reviewCount` | Number | no | `0` | |
| `observations` | [ObjectId] | no | — | Refs → `Observation` |
| `lastObservation` | Date | no | `null` | |
| `consensusStatus` | String | no | `"Pending"` | Enum: `"Pending"`, `"ConsensusReached"`, `"MoreAnnotationsNeeded"` |
| `speciesConsensus` | [**SpeciesConsensus**] | no | — | Array of subdocs (see below) |
| `reviewers` | [ObjectId] | no | — | Refs → `User` |
| `needsReview` | Boolean | no | `false` | |
| `flagged` | Boolean | no | `false` | |
| `removed` | Boolean | no | `false` | Soft-delete flag |
| `createdAt` | Date | auto | — | Mongoose timestamp |
| `updatedAt` | Date | auto | — | Mongoose timestamp |

### Subdocument: FileLocation

| Field | Type | Default |
|---|---|---|
| `publicURL` | String | — |
| `relativePath` | [String] | — |
| `filePath` | String | — |
| `filePublic` | Boolean | — |
| `fileName` | String | — |
| `createdAt` | Date | `Date.now` |
| `updatedAt` | Date | `Date.now` |

### Subdocument: AiResult

| Field | Type | Notes |
|---|---|---|
| `modelName` | String | Name of the AI model |
| `runDate` | String | Date the model was run |
| `confBlank` | Number | Confidence score: blank |
| `confHuman` | Number | Confidence score: human |
| `confAnimal` | Number | Confidence score: animal |

### Subdocument: MediaComment

| Field | Type | Default |
|---|---|---|
| `text` | String | — |
| `author` | ObjectId (→ `User`) | — |
| `timestamp` | Date | `Date.now` |

### Subdocument: SpeciesConsensus

| Field | Type | Default |
|---|---|---|
| `observationType` | String | — |
| `scientificName` | String | — |
| `taxonID` | String | — |
| `count` | Number | — |
| `accepted` | Boolean | `false` |
| `observationCount` | Number | `0` |

**Indexes:**
- `{ relativePath: 1 }`
- `{ mediaID: 1 }` (unique)

**Consensus logic:** When observations are added, the `updateObservationsAndCheckConsensus` method groups observations by type, counts agreement per species+count combination, and marks a consensus entry as `accepted` when 3+ observers agree. `consensusStatus` is set to `"ConsensusReached"` when all entries are accepted, `"MoreAnnotationsNeeded"` when some are, or `"Pending"` otherwise.

---

## 5. Observation

**Collection:** `observations`
**Mongoose model name:** `Observation`

| Field | Type | Required | Default | Constraints / Notes |
|---|---|---|---|---|
| `_id` | ObjectId | auto | — | Primary key |
| `deploymentId` | ObjectId | no | — | Ref → `Deployment` |
| `mediaId` | String | no | — | Ref → `Media` (uses `mediaID` string, not ObjectId) |
| `mediaInfo.md5` | String | no | — | |
| `mediaInfo.imageHash` | String | no | — | |
| `eventId` | String | no | — | |
| `eventStart` | Date | **yes** | — | |
| `eventEnd` | Date | **yes** | — | |
| `observationLevel` | String | **yes** | `"media"` | Enum: `"media"`, `"event"` |
| `observationType` | String | **yes** | `"animal"` | Enum: `"animal"`, `"human"`, `"vehicle"`, `"blank"`, `"unknown"`, `"unclassified"` |
| `cameraSetupType` | String | no | — | |
| `taxonId` | String | no | — | |
| `scientificName` | String | no | — | |
| `count` | Number | no | — | min: 1 |
| `lifeStage` | String | no | — | |
| `sex` | String | no | — | |
| `behavior` | String | no | — | |
| `individualID` | String | no | — | |
| `individualPositionRadius` | Number | no | — | min: 0 |
| `individualPositionAngle` | Number | no | — | min: -90, max: 90 |
| `individualSpeed` | Number | no | — | min: 0 |
| `bboxX` | Number | no | — | min: 0, max: 1 (normalized) |
| `bboxY` | Number | no | — | min: 0, max: 1 (normalized) |
| `bboxWidth` | Number | no | — | min: 1e-15, max: 1 (normalized) |
| `bboxHeight` | Number | no | — | min: 1e-15, max: 1 (normalized) |
| `classificationMethod` | String | no | — | |
| `classifiedBy` | String | no | — | |
| `classificationTimestamp` | Date | no | — | |
| `classificationProbability` | Number | no | — | min: 0, max: 1 |
| `observationTags` | String | no | — | Can be used to flag notable images |
| `observationComments` | String | no | — | |
| `creator` | ObjectId | no | — | Ref → `User` |
| `createdAt` | Date | auto | — | Mongoose timestamp |
| `updatedAt` | Date | auto | — | Mongoose timestamp |

**Middleware:**
- `post('save')` and `post('remove')` trigger media consensus recalculation via `CameratrapMedia.updateObservationsForMedia(mediaId)`.
- `pre/post('findOneAndUpdate')` does the same, also handling the case where `mediaId` changes (updates both old and new media).

---

## Shared Subdocument: Point (GeoJSON)

Used by `Deployment.location` and `DeploymentLocation.location`.

| Field | Type | Required | Constraints |
|---|---|---|---|
| `type` | String | **yes** | Enum: `"Point"` |
| `coordinates` | [Number] | **yes** | `[longitude, latitude]` |
| `angle` | Number | no | min: 0, max: 359, must be integer |

---

## Notes for External Consumers

1. **ObjectId format:** 24-character hex string (e.g. `"507f1f77bcf86cd799439011"`). In most languages, treat as a string unless your MongoDB driver has a native ObjectId type.
2. **`mediaID` vs `_id`:** Media documents are primarily looked up by the `mediaID` string field (the MD5 hash), not the MongoDB `_id`. The `Observation.mediaId` field is a string referencing this value.
3. **Timestamps:** All `Date` fields are stored as ISODate in MongoDB. Expect ISO 8601 strings in JSON serialization (e.g. `"2025-06-15T14:30:00.000Z"`).
4. **Mixed fields:** `exifData` on Media accepts any shape — there is no enforced schema for that sub-object.
5. **Soft deletes:** Media uses a `removed` boolean rather than actual document deletion.
6. **Virtuals are not stored:** `mediaCount`, `observationCount`, `deployments`, and `isActive` are computed at query time and will not appear in raw database exports.
