import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import mongoose from "mongoose";
// import Plant from "../models/Plant";
import IndividualPlant from "/models/IndividualPlant";
import Module from "/models/Module";
import dbConnect from "lib/db/setup";
export async function GET(req) {
  await dbConnect();
  const url = new URL(req.url);
  let sectionId = url.searchParams.get("sectionId");
  //   const sectionId = "66205d46f994ebe9e71dc38e";
  console.log(sectionId);
  if (!sectionId) {
    //     let sectionId = "66205d46f994ebe9e71dc38e";
    return NextResponse.json(
      { error: "sectionId is required" },
      { status: 400 }
    );
  }
  const doc = new jsPDF();

  // Function to get distinct plants based on module coordinates
  async function getP(x, y) {
    const pnum = await Module.find({ x, y, sectionId: sectionId })
      .distinct("_id")
      .then(async (usedMods) => {
        let tagMods = usedMods.map((id) => new mongoose.Types.ObjectId(id)); // Use 'new' keyword here
        console.log("tagMods", tagMods);
        return await IndividualPlant.aggregate([
          { $match: { module: { $in: tagMods } } },
          {
            $group: {
              _id: "$plant",
              count: { $sum: 1 },
              xy: { $push: { y: "$y", x: "$x" } },
            },
          },
          {
            $lookup: {
              from: "plants",
              localField: "_id",
              foreignField: "_id",
              as: "plants",
            },
          },
          {
            $project: {
              _id: 1,
              count: 1,
              plantName: "$plants.scientific_name",
              commonName: "$plants.common_name",
              plantId: "$plants._id",
              notes: "$module.notes",
              xy: "$xy",
            },
          },
          { $sort: { plantName: 1 } },
        ]);
      });
    return pnum;
  }

  // Function to generate plant information and draw it on the PDF
  async function generatePlants(x, y) {
    const gp = await getP(x, y);
    gp.forEach((plant, i) => {
      plant.xy.forEach((placement) => {
        const leftMargin = 24 + 5;
        const topMargin = 100 + 3;
        const radius = 5;
        const xPos = leftMargin + radius + placement.x * 15;
        const yPos = topMargin + radius + placement.y * 12;

        doc.setFont("Helvetica", "Bold");
        doc.setFontSize(20);
        doc.setTextColor("#ffffff");
        doc.setFillColor("#333333");
        doc.circle(xPos, yPos, radius, "F");
        doc.text((i + 1).toString(), xPos, yPos, {
          align: "center",
          baseline: "middle",
        });
      });
    });
    doc.setFillColor("#000000");
    doc.setTextColor("#000000");
  }

  async function gettingPlants(x, y) {
    let thePlants = [];
    const ppp = await getP(x, y);
    console.log(ppp);
    //   let plantLength = ppp.length;
    for (var i = 0; i < ppp.length; i++) {
      let id = i + 1;
      let x = {
        id: id.toString(),
        scientific_name: ppp[i].plantName[0] || "",
        num: ppp[i].count.toString(),
        notes: ppp[i].notes || " ",
      };
      // "common_name":ppp[i].commonName[0]}
      thePlants.push(x);
    }
    console.log("theplants", thePlants);
    return thePlants;
  }

  function createHeaders(keys) {
    var result = [];
    for (var i = 0; i < keys.length; i += 1) {
      result.push({
        id: keys[i],
        name: keys[i],
        prompt: keys[i],
        width: 65,
        align: "center",
        padding: 0,
      });
    }
    return result;
  }

  var headers = createHeaders([
    "id",
    "scientific_name",
    "num",
    "notes",
    // "common_name",
  ]);
  // Function to process modules based on tags
  async function gettingModule(sectionId) {
    const allMods = await Module.find({ sectionId: sectionId }); // Filter by sectionId
    const minfo = await Module.find({ sectionId: sectionId });

    for (const mod of minfo) {
      const plantTable = await gettingPlants(mod.x, mod.y);
      groupRender(mod, minfo, mod);
      await generatePlants(mod.x, mod.y);
      //   await drawModShape(mod.shape, mod.orientation, mod.flipped);
      await generateBrackets(
        await bracketFinder(mod.x, mod.y, mod.orientation, mod.flipped)
      );
      doc.setTextColor("#ffffff");
      // xy rectangle
      doc.setFillColor("#000000");
      doc.rect(10, 10, 24, 50, "F");
      //   doc.rect(10, 10, 24, 50);
      doc.rect(10, 10, 65, 50);
      doc.setFontSize(60);
      doc.text("X\nY", 15, 30);
      // Mod number
      doc.setTextColor("#000000");
      doc.text(mod.x + "\n" + mod.y, 35, 30);

      const shapeColor = generateShapeInfo(
        mod.shape,
        mod.orientation,
        mod.model
      );

      //   doc.setFontSize(22);

      //   doc.text(
      //     `${mod.shape} ${mod.model} ${mod.orientation} (${shapeColor})`,
      //     15,
      //     70
      //   );
      //table
      doc.table(84, 10, plantTable, headers, {
        autoSize: true,
      });
      // Mod model info
      doc.setFontSize(22);
      let modModel = `${mod.shape} ${mod.model} ${mod.orientation} (${shapeColor})`;
      doc.text(modModel, 15, 70);
      // draw module Shape
      await drawModShape(mod.shape, mod.orientation, mod.flipped);
      //Home Corners
      let x1 = 24;
      let y1 = 100;
      let x2 = x1 + 156;
      let y2 = y1 + 52;
      let osx = 156; // offset X
      let osy = 52; // offset Y
      doc.setFontSize(9);
      doc.text(" 00Blue>\nHome \nCorner ", 18, 150, { align: "right" });
      doc.text("< Yellow\n Home\n Corner", 190, 100, { align: "left" });

      //text box
      doc.setLineWidth(0);
      doc.setFontSize(22);
      doc.text("Notes", 118, 174, { baseline: "bottom" });
      doc.rect(118, 174, 65, 40);
      doc.setLineWidth(2);
      doc.setFontSize(14);
      let notes = `${mod.notes}                                                ${mod.tags} \n Flipped= ${mod.flipped} `;
      doc.text(notes, 120, 176, { baseline: "top", maxWidth: 64 });

      // Add more module details here if necessary...

      doc.addPage();
    }
  }

  // Bracket finder logic
  async function bracketFinder(x, y, orientation, flipped) {
    const allMods = await Module.find();
    let brackets = {
      lt: false,
      tl: false,
      tr: false,
      rt: false,
      rb: false,
      br: false,
      bl: false,
      lb: false,
    };
    const modsToCheck = {
      left: x + 1,
      right: x - 1,
      top: y + 1,
      bottom: y - 1,
    };

    for (const mod of allMods) {
      // Check and set brackets based on module positions and orientation...
    }

    eliminateBrackets(brackets, orientation, flipped);
    return brackets;
  }

  // Function to draw module shapes on the PDF
  async function drawModShape(shape, orientation, flipped) {
    const x1 = 24;
    const y1 = 100;
    const x2 = x1 + 156;
    const y2 = y1 + 52;
    const osx = 156; // offset X
    const osy = 52; // offset Y

    if (["R3", "R2.3"].includes(shape)) {
      doc.rect(x1, y1, osx, osy);
    }
    if (["T3", "T2.3"].includes(shape)) {
      if (shape == "T3" || shape == "T2.3") {
        if (orientation === "LH") {
          if (flipped === true) {
            doc.triangle(x1, y1, x1, y2, x1, y1);
          } else {
            doc.triangle(x1, y2, x2, y2, x2, y1);
          }
        }
        if (orientation === "RH") {
          if (flipped === true) {
            doc.triangle(x1, y1, x2, y1, x2, y2);
          } else {
            doc.triangle(x1, y1, x1, y2, x2, y2);
          }
        }
      }
    }
  }

  // Function to generate brackets on the PDF
  async function generateBrackets(brackets) {
    const x1 = 24;
    const y1 = 100;
    const x2 = x1 + 156;
    const y2 = y1 + 52;
    const bSize = 8;

    doc.setLineWidth(2);

    if (brackets.lt) doc.line(x1, y1, x1 - bSize, y1);
    if (brackets.tl) doc.line(x1, y1, x1, y1 - bSize);
    if (brackets.tr) doc.line(x2, y1, x2, y1 - bSize);
    if (brackets.rt) doc.line(x2, y1, x2 + bSize, y1);
    if (brackets.rb) doc.line(x2, y2, x2 + bSize, y2);
    if (brackets.br) doc.line(x2, y2, x2, y2 + bSize);
    if (brackets.bl) doc.line(x1, y2, x1, y2 + bSize);
    if (brackets.lb) doc.line(x1, y2, x1 - bSize, y2);

    doc.setLineWidth(0);
  }

  // Function to eliminate unnecessary brackets
  function eliminateBrackets(brackets, orientation, flipped) {
    // Implement the logic to eliminate brackets based on orientation and flipped status...
  }

  // Function to determine shape color
  function generateShapeInfo(shape, orientation, model) {
    let color;
    if (model === "5-d") {
      if (shape === "R3") color = "Brown";
      if (shape === "T3") color = orientation === "RH" ? "Yellow" : "Purple";
    }
    if (model === "3-d") {
      if (shape === "R2.3") color = "Lime Green";
      if (shape === "R3") color = "Green";
      if (shape === "T3") color = orientation === "RH" ? "Blue" : "Pink";
      if (shape === "T2.3") color = orientation === "RH" ? "Yellow" : "Orange";
    }
    return color;
  }

  function generateGroups(mod, allMods) {
    // groups = ['A','B','C','D','E','F','G','H','I','J','K','M','N','O','P'];
    //   groups = ["M", "N", "O", "P"];
    //   subGroups = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
    //   thisModGroup = returnGroup(mod.tags, groups, subGroups);
    //   console.log("thismod", thisModGroup);
    //   AllModsInGroup = returnAllModsInGroup(
    //     allMods,
    //     thisModGroup.group,
    //     thisModGroup.subgroup,
    //     subGroups
    //   );
    //returnAllGroups(allMods, groups,subGroups)
    //   groupText = `Group: ${thisModGroup.group}${thisModGroup.subgroup}`;
    //   groupNum = `Group: ${thisModGroup.group}`;
    //   doc.setFontSize(22);
    //   doc.text(groupText, 18, 176); //{baseline:'top', maxWidth: 64}
    //   doc.text(groupNum, 18, 226);
    groupRender(thisModGroup, AllModsInGroup, mod);
  }

  function moduleCoordinates(
    shape,
    orientation,
    flipped,
    width,
    height,
    homeX,
    homeY,
    options = "S"
  ) {
    console.log(
      "moduleCoordinates",
      shape,
      orientation,
      flipped,
      width,
      height,
      homeX,
      homeY
    );
    if (["T3", "T2.3"].includes(shape)) {
      const xTl = homeX;
      const yTl = homeY;
      const xTr = homeX + width;
      const yTr = homeY;
      const xBl = homeX;
      const yBl = homeY + height;
      const xBr = homeX + width;
      const yBr = homeY + height;
      let coordinates;
      // doc.setLineWidth();

      if (orientation === "RH") {
        if (flipped === true) {
          console.log("flippped", xTl, yTl, xTr, yTr, xBr, yBr);
          doc.triangle(xTl, yTl, xTr, yTr, xBr, yBr, options);
        } else {
          doc.triangle(xTl, yTl, xBl, yBl, xBr, yBr, options);
        }
      } else if (orientation === "LH") {
        if (flipped === true) {
          doc.triangle(xTr, yTr, xBl, yBl, xTl, yTl, options);
        } else {
          doc.triangle(xTr, yTr, xBr, yBr, xBl, yBl, options);
        }
      }
    }
    if (orientation === "flat") {
      console.log("oeuttuhoeh", homeX, homeY, width, height);
      doc.rect(homeX, homeY, width, height, options);
    }
  }

  function difference(a, b) {
    return Math.abs(a - b);
  }
  function groupRender(thisMod, AllModsInGroup, mod) {
    let thisSubGroup = [];
    let thisGroup = AllModsInGroup;
    let largestSubX = -1;
    let largestSubY = -1;
    let largestX = -1;
    let largestY = -1;
    // for (var i = 0; i < AllModsInGroup.length; i++) {
    //   if (thisMod.group === AllModsInGroup[i].groupInfo.group) {
    //     thisGroup.push(AllModsInGroup[i]);
    //     if (AllModsInGroup[i].x > largestX) {
    //       largestX = AllModsInGroup[i].x;
    //     }
    //     if (AllModsInGroup[i].y > largestY) {
    //       console.log("true");
    //       largestY = AllModsInGroup[i].y;
    //     }
    //     // get mod subgroup
    //     if (thisMod.subgroup === AllModsInGroup[i].groupInfo.subgroup) {
    //       thisSubGroup.push(AllModsInGroup[i]);
    //       if (AllModsInGroup[i].x > largestSubX) {
    //         largestSubX = AllModsInGroup[i].x;
    //       }
    //       if (AllModsInGroup[i].y > largestSubY) {
    //         console.log("true");
    //         largestSubY = AllModsInGroup[i].y;
    //       }
    //     }
    //     // console.log();
    //   }
    // }
    console.log("thisSub", thisSubGroup, largestSubY);
    // starting position of selection
    let startX = 18;
    let startY = 178;
    let rectSizeX = 30;
    let rectSizeY = 10;

    let subgroup;
    // for (var i = 0; i < thisSubGroup.length; i++) {
    //   x = thisSubGroup[i].x;
    //   y = thisSubGroup[i].y;
    //   xMultiple = difference(x, largestSubX);
    //   yMultiple = difference(y, largestSubY);
    //   console.log("yMult", yMultiple, difference(y, largestSubY));
    //   modStartX = xMultiple * rectSizeX + startX;
    //   modStartY = yMultiple * rectSizeY + startY;
    //   console.log("modStartX", x, modStartY);

    //   if (mod.x == x && mod.y == y) {
    //     fill = "FD";
    //     doc.setFillColor("#D3D3D3");
    //   } else {
    //     fill = "S";
    //     doc.setFillColor("#ffffff");
    //   }
    //   console.log(
    //     "allinfo",
    //     thisSubGroup[i].shape,
    //     thisSubGroup[i].orientation,
    //     thisSubGroup[i].flipped,
    //     rectSizeX,
    //     rectSizeY,
    //     modStartX,
    //     modStartY,
    //     fill
    //   );
    //   moduleCoordinates(
    //     thisSubGroup[i].shape,
    //     thisSubGroup[i].orientation,
    //     thisSubGroup[i].flipped,
    //     rectSizeX,
    //     rectSizeY,
    //     modStartX,
    //     modStartY,
    //     fill
    //   );
    //   doc.text(
    //     `${x},${y}`,
    //     modStartX + rectSizeX / 2,
    //     modStartY + rectSizeY / 2,
    //     { align: "center", baseline: "middle" }
    //   );
    // }
    for (var n = 0; n < thisGroup.length; n++) {
      console.log("thisgroupn", thisGroup[n]);
      let startX = 28;
      let startY = 232;
      let rectSizeX = 12;
      let rectSizeY = 4;
      let x = thisGroup[n].x;
      let y = thisGroup[n].y;
      let xGroupMultiple = difference(x, largestX);
      let yGroupMultiple = difference(y, largestY);
      //   console.log("yMult", yMultiple, difference(y, largestSubY));
      let modStartX = xGroupMultiple * rectSizeX + startX;
      let modStartY = yGroupMultiple * rectSizeY + startY;
      let fill;
      console.log("modStartX", x, y);
      if (
        //   thisSubGroup[0].groupInfo.subgroup == thisGroup[n].groupInfo.subgroup
        thisGroup[n] == mod
      ) {
        fill = "FD";
        doc.setFillColor("#b9b9b9");
      } else {
        fill = "S";
        doc.setFillColor("#ffffff");
      }
      doc.setFontSize(6);
      doc.setLineWidth(0);
      moduleCoordinates(
        thisGroup[n].shape,
        thisGroup[n].orientation,
        thisGroup[n].flipped,
        rectSizeX,
        rectSizeY,
        modStartX,
        modStartY,
        fill
      );
      doc.text(
        `${x},${y}`,
        modStartX + rectSizeX / 2,
        modStartY + rectSizeY / 2,
        { align: "center", baseline: "middle" }
      );
    }
    // doc.text(`Group: ${thisSubGroup[0].groupInfo.group}`,modStartX, 228,{align: 'center'});
  }

  // Generate the PDF by processing a specific module
  await gettingModule("66205d46f994ebe9e71dc38e");

  // Return the generated PDF
  const pdfBytes = doc.output("arraybuffer");

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="generated-server.pdf"',
    },
  });
}
