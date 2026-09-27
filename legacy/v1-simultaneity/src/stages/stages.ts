import type { Frame } from "../physics/model";
export type CameraView = "Overview" | "Side" | "Center";
export type Stage = {
  title: string;
  subtitle: string;
  question: string;
  frame: Frame;
  camera: CameraView;
  takeaway: string;
  formula: string[];
  terms: string[];
  observe: string;
  diagram: "minimal" | "station" | "rays" | "axes" | "projection" | "now";
  pulses: boolean;
  coordinates: boolean;
  clocks: boolean;
  now: boolean;
  timeline: "setup" | "emissions" | "continue";
};
export const stages: Stage[] = [
  {
    title: "Setup",
    subtitle: "Define the events",
    question: "What makes two events different?",
    frame: "station",
    camera: "Overview",
    takeaway:
      "An event is something that happens at a specific position and time.",
    formula: ["Event = (x, t)"],
    terms: ["Event", "Position", "Time", "Reference frame"],
    observe:
      "A and B mark two distinct positions, 300 m apart in the station. The train observer is at the midpoint when t = 0.",
    diagram: "minimal",
    pulses: false,
    coordinates: false,
    clocks: false,
    now: false,
    timeline: "setup",
  },
  {
    title: "Station Frame",
    subtitle: "Simultaneous in the station",
    question: "Can separated events happen at the same time?",
    frame: "station",
    camera: "Side",
    takeaway: "In the Station Frame, Events A and B occur at the same time.",
    formula: ["Δt = tB − tA = 0"],
    terms: ["Simultaneous", "Station Frame", "Coordinate time"],
    observe:
      "Play through t = 0. Both lightning flashes originate at A and B together, even though the train is moving.",
    diagram: "station",
    pulses: false,
    coordinates: true,
    clocks: true,
    now: false,
    timeline: "emissions",
  },
  {
    title: "Light Reception",
    subtitle: "Receiving is not happening",
    question: "Does seeing a flash first mean it happened first?",
    frame: "station",
    camera: "Overview",
    takeaway:
      "Receiving one flash first does not by itself prove that it was emitted first.",
    formula: ["distance = c × travel time"],
    terms: ["Emission", "Reception", "Light signal", "Observer"],
    observe:
      "Circular emission markers and diamond reception markers represent different events. The moving observer meets the front signal first when β > 0.",
    diagram: "rays",
    pulses: true,
    coordinates: true,
    clocks: true,
    now: false,
    timeline: "continue",
  },
  {
    title: "Train Frame",
    subtitle: "Different event times",
    question: "What times does the train assign to the same events?",
    frame: "train",
    camera: "Side",
    takeaway:
      "Separated events simultaneous in the station have different train times when β > 0.",
    formula: ["Δt = 0;  Δt′ ≠ 0  (β > 0)"],
    terms: ["Train Frame", "Transformed time", "Same physical events"],
    observe:
      "The train stays still and the station moves left. Compare emission coordinates, rather than using signal arrival order to infer emission order.",
    diagram: "axes",
    pulses: true,
    coordinates: true,
    clocks: true,
    now: false,
    timeline: "continue",
  },
  {
    title: "Lorentz Time",
    subtitle: "Transforming the events",
    question: "Why does position enter a time calculation?",
    frame: "train",
    camera: "Overview",
    takeaway: "Time coordinates depend on both time and position.",
    formula: ["γ = 1 / √(1 − β²)", "t′ = γ(t − vx/c²)"],
    terms: ["Lorentz transformation", "β = v/c", "Lorentz factor γ"],
    observe:
      "Increase β. The emission times separate symmetrically around zero. At β = 0 both frames agree.",
    diagram: "projection",
    pulses: true,
    coordinates: true,
    clocks: true,
    now: false,
    timeline: "continue",
  },
  {
    title: "Different “Now”",
    subtitle: "Spacetime explanation",
    question: "Is there one universal definition of now?",
    frame: "train",
    camera: "Overview",
    takeaway: "Different inertial frames have different definitions of “now”.",
    formula: ["Δt′ = γ(Δt − vΔx/c²)", "Δt = 0  ⇒  Δt′ = −γvΔx/c²"],
    terms: ["Spacetime", "Simultaneity slice", "Inertial frame"],
    observe:
      "The train’s x′ axis is its t′ = 0 line. As β increases it tilts away from the station’s t = 0 line.",
    diagram: "now",
    pulses: true,
    coordinates: true,
    clocks: true,
    now: true,
    timeline: "continue",
  },
];
