// Hand-written setup & maintenance guides for prioritybicycles.com products,
// matched to each ordered item by its product name.

import type { ItemGuide } from "@/lib/tracking";

export const ITEM_GUIDES: { match: RegExp; guide: ItemGuide }[] = [
  {
    match: /battery/i,
    guide: {
      setup: [
        "Charge to 100% before first use, until the charger shows full.",
        "Slide the battery into the frame mount until it clicks.",
        "Lock it in with the key, and take the key out before riding.",
        "Power on from the display and check the charge level.",
      ],
      maintain: [
        "Charge indoors at room temperature, away from heat.",
        "Not riding for a few weeks? Store it at around 50–80%.",
        "Top it up once a month while in storage.",
        "Keep the contacts clean and dry.",
      ],
    },
  },
  {
    match: /bundle/i,
    guide: {
      setup: [
        "Check every piece against the packing list.",
        "Bolt the rack to the frame eyelets, tightening evenly.",
        "Strap the bag on clear of the brakes and cables.",
        "Keep the lock's spare key or code somewhere safe.",
        "Load the rack and test it on a short ride first.",
      ],
      maintain: [
        "Recheck the rack bolts after your first few rides, then monthly.",
        "Stay within the rack's maximum load.",
        "Wipe the bag with a damp cloth and let it air dry.",
        "Add a drop of dry lube to the lock cylinder now and then.",
      ],
    },
  },
  {
    match: /rack/i,
    guide: {
      setup: [
        "Confirm the rack fits your bike model.",
        "Attach it to the fork and head tube mounts.",
        "Tighten the bolts evenly to the torque in the manual.",
        "Turn the bars to check the steering is free and the rack clears the tyre.",
      ],
      maintain: [
        "Recheck the bolts after your first few rides, then monthly.",
        "Stay within the rated load and keep it centred.",
        "Wipe clean and check for cracks or bent struts.",
      ],
    },
  },
  {
    match: /./,
    guide: {
      setup: [
        "Unpack and check everything against the packing list.",
        "Follow the included instructions and tighten every bolt.",
        "Test it on a short ride before heading out.",
      ],
      maintain: [
        "Recheck bolts and fittings monthly.",
        "Wipe clean after wet or dusty rides.",
        "Contact Priority support if anything feels loose or worn.",
      ],
    },
  },
];
