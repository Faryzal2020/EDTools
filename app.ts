/**
 * EDTools Modernized Client - Elite Dangerous 4.2
 * Live in-game telemetry visualizer & context-aware diagnostic engine
 */

// -------------------------------------------------------------
// 1. Comprehensive Action Registry (including 4.2 Colonisation & Titan Actions)
// -------------------------------------------------------------
const ACTION_REGISTRY = {
  // --- SHIP: Flight Rotation ---
  MouseReset: { area: "Ship Controls", subContext: "Flight", category: "Flight Rotation", label: "Reset Mouse" },
  YawLeftButton: { area: "Ship Controls", subContext: "Flight", category: "Flight Rotation", label: "Yaw Left" },
  YawRightButton: { area: "Ship Controls", subContext: "Flight", category: "Flight Rotation", label: "Yaw Right" },
  YawToRollButton: { area: "Ship Controls", subContext: "Flight", category: "Flight Rotation", label: "Yaw/Roll Toggle" },
  RollLeftButton: { area: "Ship Controls", subContext: "Flight", category: "Flight Rotation", label: "Roll Left" },
  RollRightButton: { area: "Ship Controls", subContext: "Flight", category: "Flight Rotation", label: "Roll Right" },
  PitchUpButton: { area: "Ship Controls", subContext: "Flight", category: "Flight Rotation", label: "Pitch Up" },
  PitchDownButton: { area: "Ship Controls", subContext: "Flight", category: "Flight Rotation", label: "Pitch Down" },

  // --- SHIP: Thrust & Throttle ---
  LeftThrustButton: { area: "Ship Controls", subContext: "Flight", category: "Flight Thrust", label: "Thrust Left" },
  RightThrustButton: { area: "Ship Controls", subContext: "Flight", category: "Flight Thrust", label: "Thrust Right" },
  UpThrustButton: { area: "Ship Controls", subContext: "Flight", category: "Flight Thrust", label: "Thrust Up" },
  DownThrustButton: { area: "Ship Controls", subContext: "Flight", category: "Flight Thrust", label: "Thrust Down" },
  ForwardThrustButton: { area: "Ship Controls", subContext: "Flight", category: "Flight Thrust", label: "Thrust Forward" },
  BackwardThrustButton: { area: "Ship Controls", subContext: "Flight", category: "Flight Thrust", label: "Thrust Backward" },
  ForwardKey: { area: "Ship Controls", subContext: "Flight", category: "Flight Throttle", label: "Throttle Up" },
  BackwardKey: { area: "Ship Controls", subContext: "Flight", category: "Flight Throttle", label: "Throttle Down" },
  ToggleReverseThrottleInput: { area: "Ship Controls", subContext: "Flight", category: "Flight Throttle", label: "Reverse Throttle" },
  SetSpeedZero: { area: "Ship Controls", subContext: "Flight", category: "Flight Throttle", label: "Set Speed 0%" },
  SetSpeed25: { area: "Ship Controls", subContext: "Flight", category: "Flight Throttle", label: "Set Speed 25%" },
  SetSpeed50: { area: "Ship Controls", subContext: "Flight", category: "Flight Throttle", label: "Set Speed 50%" },
  SetSpeed75: { area: "Ship Controls", subContext: "Flight", category: "Flight Throttle", label: "Set Speed 75%" },
  SetSpeed100: { area: "Ship Controls", subContext: "Flight", category: "Flight Throttle", label: "Set Speed 100%" },
  SetSpeedMinus25: { area: "Ship Controls", subContext: "Flight", category: "Flight Throttle", label: "Set Speed -25%" },
  SetSpeedMinus50: { area: "Ship Controls", subContext: "Flight", category: "Flight Throttle", label: "Set Speed -50%" },
  SetSpeedMinus75: { area: "Ship Controls", subContext: "Flight", category: "Flight Throttle", label: "Set Speed -75%" },
  SetSpeedMinus100: { area: "Ship Controls", subContext: "Flight", category: "Flight Throttle", label: "Set Speed -100%" },

  // --- SHIP: Flight Misc & Systems ---
  ToggleFlightAssist: { area: "Ship Controls", subContext: "Flight", category: "Flight Misc", label: "Toggle Flight Assist (FA)" },
  UseBoostJuice: { area: "Ship Controls", subContext: "Flight", category: "Flight Misc", label: "Engine Boost" },
  HyperSuperCombination: { area: "Ship Controls", subContext: "Flight", category: "Flight Misc", label: "Hyperspace / Supercruise" },
  Supercruise: { area: "Ship Controls", subContext: "Flight", category: "Flight Misc", label: "Supercruise Only" },
  Hyperspace: { area: "Ship Controls", subContext: "Flight", category: "Flight Misc", label: "Hyperspace Jump" },
  OrbitLinesToggle: { area: "Ship Controls", subContext: "Flight", category: "Flight Misc", label: "Toggle Orbit Lines" },
  DisableRotationCorrectToggle: { area: "Ship Controls", subContext: "Flight", category: "Flight Misc", label: "Rotational Correction" },
  LandingGearToggle: { area: "Ship Controls", subContext: "Flight", category: "Flight Landing", label: "Landing Gear" },
  ToggleCargoScoop: { area: "Ship Controls", subContext: "Flight", category: "Flight Misc", label: "Cargo Scoop" },
  EjectAllCargo: { area: "Ship Controls", subContext: "Flight", category: "Flight Misc", label: "Eject All Cargo" },
  ShipSpotLightToggle: { area: "Ship Controls", subContext: "Flight", category: "Flight Misc", label: "Ship Lights" },
  NightVisionToggle: { area: "Ship Controls", subContext: "Flight", category: "Flight Misc", label: "Night Vision" },

  // --- SHIP: Targeting ---
  SelectTarget: { area: "Ship Controls", subContext: "Flight", category: "Targeting", label: "Target Ahead" },
  CycleNextTarget: { area: "Ship Controls", subContext: "Flight", category: "Targeting", label: "Cycle Next Target" },
  CyclePreviousTarget: { area: "Ship Controls", subContext: "Flight", category: "Targeting", label: "Cycle Prev Target" },
  SelectHighestThreat: { area: "Ship Controls", subContext: "Flight", category: "Targeting", label: "Highest Threat" },
  CycleNextHostileTarget: { area: "Ship Controls", subContext: "Flight", category: "Targeting", label: "Next Hostile Target" },
  CyclePreviousHostileTarget: { area: "Ship Controls", subContext: "Flight", category: "Targeting", label: "Prev Hostile Target" },
  TargetWingman0: { area: "Ship Controls", subContext: "Flight", category: "Targeting", label: "Target Wingman 1" },
  TargetWingman1: { area: "Ship Controls", subContext: "Flight", category: "Targeting", label: "Target Wingman 2" },
  TargetWingman2: { area: "Ship Controls", subContext: "Flight", category: "Targeting", label: "Target Wingman 3" },
  SelectTargetsTarget: { area: "Ship Controls", subContext: "Flight", category: "Targeting", label: "Target's Target" },
  WingNavLock: { area: "Ship Controls", subContext: "Flight", category: "Targeting", label: "Wing Nav Lock" },
  CycleNextSubsystem: { area: "Ship Controls", subContext: "Flight", category: "Targeting", label: "Next Subsystem" },
  CyclePreviousSubsystem: { area: "Ship Controls", subContext: "Flight", category: "Targeting", label: "Prev Subsystem" },
  TargetNextRouteSystem: { area: "Ship Controls", subContext: "Flight", category: "Targeting", label: "Next System in Route" },

  // --- SHIP: Weapons & Defense ---
  PrimaryFire: { area: "Ship Controls", subContext: "Flight", category: "Weapons", label: "Primary Fire" },
  SecondaryFire: { area: "Ship Controls", subContext: "Flight", category: "Weapons", label: "Secondary Fire" },
  CycleFireGroupNext: { area: "Ship Controls", subContext: "Flight", category: "Weapons", label: "Next Firegroup" },
  CycleFireGroupPrevious: { area: "Ship Controls", subContext: "Flight", category: "Weapons", label: "Prev Firegroup" },
  DeployHardpointToggle: { area: "Ship Controls", subContext: "Flight", category: "Weapons", label: "Deploy Hardpoints" },
  DeployHeatSink: { area: "Ship Controls", subContext: "Flight", category: "Weapons", label: "Deploy Heatsink" },
  FireChaffLauncher: { area: "Ship Controls", subContext: "Flight", category: "Weapons", label: "Fire Chaff" },
  UseShieldCell: { area: "Ship Controls", subContext: "Flight", category: "Weapons", label: "Shield Cell Bank" },
  ChargeECM: { area: "Ship Controls", subContext: "Flight", category: "Weapons", label: "Charge ECM" },
  TriggerFieldNeutraliser: { area: "Ship Controls", subContext: "Flight", category: "Weapons", label: "Pulse Neutraliser (Titan)" },
  TriggerColonisationModule: { area: "Ship Controls", subContext: "Flight", category: "Weapons", label: "Colonisation Module" },
  BlockMouseDecay: { area: "Ship Controls", subContext: "Flight", category: "Flight Misc", label: "Block Mouse Decay" },

  // --- SHIP: Power Distribution ---
  IncreaseEnginesPower: { area: "Ship Controls", subContext: "Flight", category: "Power Dist", label: "Pips: Engines (ENG)" },
  IncreaseWeaponsPower: { area: "Ship Controls", subContext: "Flight", category: "Power Dist", label: "Pips: Weapons (WEP)" },
  IncreaseSystemsPower: { area: "Ship Controls", subContext: "Flight", category: "Power Dist", label: "Pips: Systems (SYS)" },
  ResetPowerDistribution: { area: "Ship Controls", subContext: "Flight", category: "Power Dist", label: "Balance Pips (RST)" },
  RadarIncreaseRange: { area: "Ship Controls", subContext: "Flight", category: "Sensors", label: "Sensor Zoom In" },
  RadarDecreaseRange: { area: "Ship Controls", subContext: "Flight", category: "Sensors", label: "Sensor Zoom Out" },

  // --- SHIP: Mode Switches & Scanners (Exclusive Sub-contexts) ---
  PlayerHUDModeToggle: { area: "Ship Controls", subContext: "Flight", category: "Modes", label: "Combat / Analysis HUD" },
  ExplorationFSSEnter: { area: "Ship Controls", subContext: "Flight", category: "Modes", label: "Enter FSS Scanner" },
  ExplorationFSSQuit: { area: "Ship Controls", subContext: "FSS", category: "Full Spectrum System Scanner", label: "Leave FSS" },
  ExplorationFSSDiscoveryScan: { area: "Ship Controls", subContext: "FSS", category: "Full Spectrum System Scanner", label: "FSS Honk (Discovery Scan)" },
  ExplorationFSSTarget: { area: "Ship Controls", subContext: "FSS", category: "Full Spectrum System Scanner", label: "FSS Target Signal" },
  ExplorationFSSShowHelp: { area: "Ship Controls", subContext: "FSS", category: "Full Spectrum System Scanner", label: "FSS Help" },
  ExplorationFSSRadioTuningX_Increase: { area: "Ship Controls", subContext: "FSS", category: "Full Spectrum System Scanner", label: "FSS Tuning Right" },
  ExplorationFSSRadioTuningX_Decrease: { area: "Ship Controls", subContext: "FSS", category: "Full Spectrum System Scanner", label: "FSS Tuning Left" },
  ExplorationFSSMiniZoomIn: { area: "Ship Controls", subContext: "FSS", category: "Full Spectrum System Scanner", label: "FSS Step Zoom In" },
  ExplorationFSSMiniZoomOut: { area: "Ship Controls", subContext: "FSS", category: "Full Spectrum System Scanner", label: "FSS Step Zoom Out" },
  ExplorationFSSZoomIn: { area: "Ship Controls", subContext: "FSS", category: "Full Spectrum System Scanner", label: "FSS Zoom In" },
  ExplorationFSSZoomOut: { area: "Ship Controls", subContext: "FSS", category: "Full Spectrum System Scanner", label: "FSS Zoom Out" },
  ExplorationSAAChangeScannedAreaViewToggle: { area: "Ship Controls", subContext: "DSS", category: "Detailed Surface Scanner", label: "Toggle Front/Back View" },
  ExplorationSAAExitThirdPerson: { area: "Ship Controls", subContext: "DSS", category: "Detailed Surface Scanner", label: "Exit DSS Mode" },
  ExplorationSAANextGenus: { area: "Ship Controls", subContext: "DSS", category: "Detailed Surface Scanner", label: "Next Bio Filter" },
  ExplorationSAAPreviousGenus: { area: "Ship Controls", subContext: "DSS", category: "Detailed Surface Scanner", label: "Prev Bio Filter" },

  // --- GENERAL: Interface & Menus ---
  UI_Up: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "UI Up" },
  UI_Down: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "UI Down" },
  UI_Left: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "UI Left" },
  UI_Right: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "UI Right" },
  UI_Select: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "UI Select" },
  UI_Back: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "UI Back" },
  UI_Toggle: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "UI Nested Toggle" },
  CycleNextPanel: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "Next Tab" },
  CyclePreviousPanel: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "Prev Tab" },
  CycleNextPage: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "Next Page" },
  CyclePreviousPage: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "Prev Page" },
  UIFocus: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "UI Focus Mode" },
  FocusLeftPanel: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "Target Panel (1)" },
  FocusCommsPanel: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "Comms Panel (2)" },
  QuickCommsPanel: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "Quick Comms (Chat)" },
  FocusRadarPanel: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "Role Panel (3)" },
  FocusRightPanel: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "Systems Panel (4)" },
  GalaxyMapOpen: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "Open Galaxy Map" },
  SystemMapOpen: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "Open System Map" },
  OpenCodexGoToDiscovery: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "Open Codex" },
  Pause: { area: "General Controls", subContext: "UI", category: "Interface Mode", label: "Pause Menu" },

  // --- GENERAL: Colony & Settlement Placement (4.2 New) ---
  PlaceSettlement: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Place Settlement" },
  ChangeConstructionOption: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Change Construction Option" },
  RotateSettlementLeft: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Rotate Left" },
  RotateSettlementRight: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Rotate Right" },
  ExitSettlementPlacementCamera: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Exit Placement Camera" },
  MovePlacementCamForward: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Placement Cam: Forward" },
  MovePlacementCamBackwards: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Placement Cam: Backward" },
  MovePlacementCamLeft: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Placement Cam: Left" },
  MovePlacementCamRight: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Placement Cam: Right" },
  MovePlacementCamUp: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Placement Cam: Up" },
  MovePlacementCamDown: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Placement Cam: Down" },
  PitchPlacementCameraUp: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Placement Cam: Pitch Up" },
  PitchPlacementCameraDown: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Placement Cam: Pitch Down" },
  YawPlacementCameraRight: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Placement Cam: Yaw Right" },
  YawPlacementCameraLeft: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Placement Cam: Yaw Left" },
  PlacementCamSpeedInc: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Placement Cam Speed +" },
  PlacementCamSpeedDec: { area: "General Controls", subContext: "SettlementPlacement", category: "Settlement Placement", label: "Placement Cam Speed -" },

  // --- GENERAL: Free Camera & Vanity Camera ---
  PhotoCameraToggle: { area: "General Controls", subContext: "Camera", category: "Camera Suite", label: "Toggle Camera Suite (Ship)" },
  PhotoCameraToggle_Buggy: { area: "General Controls", subContext: "Camera", category: "Camera Suite", label: "Toggle Camera Suite (SRV)" },
  PhotoCameraToggle_Humanoid: { area: "General Controls", subContext: "Camera", category: "Camera Suite", label: "Toggle Camera Suite (On Foot)" },
  ToggleFreeCam: { area: "General Controls", subContext: "Camera", category: "Camera Suite", label: "Toggle Free Camera" },
  FreeCamToggleHUD: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Toggle HUD" },
  MoveFreeCamForward: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Move Forward" },
  MoveFreeCamBackwards: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Move Backward" },
  MoveFreeCamLeft: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Move Left" },
  MoveFreeCamRight: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Move Right" },
  MoveFreeCamUp: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Move Up" },
  MoveFreeCamDown: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Move Down" },
  RollCameraLeft: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Roll Left" },
  RollCameraRight: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Roll Right" },
  QuitCamera: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "Exit Free Camera" },
  ToggleAdvanceMode: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Toggle Advance Mode" },
  FreeCamSpeedInc: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Speed Up" },
  FreeCamSpeedDec: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Speed Down" },
  FreeCamZoomIn: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Zoom In" },
  FreeCamZoomOut: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Zoom Out" },
  FStopInc: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Blur Inc" },
  FStopDec: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "FreeCam: Blur Dec" },
  FixCameraWorldToggle: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "Attach/Detach Camera" },
  ToggleRotationLock: { area: "General Controls", subContext: "Camera", category: "Free Camera", label: "Rotation Lock" },
  VanityCameraScrollLeft: { area: "General Controls", subContext: "Camera", category: "Camera Suite", label: "Prev Vanity Camera" },
  VanityCameraScrollRight: { area: "General Controls", subContext: "Camera", category: "Camera Suite", label: "Next Vanity Camera" },

  // --- SRV CONTROLS ---
  SteerLeftButton: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Driving", label: "Steer Left" },
  SteerRightButton: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Driving", label: "Steer Right" },
  IncreaseSpeedButtonMax: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Driving", label: "Drive Throttle Up" },
  DecreaseSpeedButtonMax: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Driving", label: "Drive Throttle Down" },
  VerticalThrustersButton: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Driving", label: "SRV Jump Thrusters" },
  AutoBreakBuggyButton: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Driving", label: "Handbrake" },
  ToggleDriveAssist: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Driving", label: "Toggle Drive Assist" },
  HeadlightsBuggyButton: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Driving", label: "SRV Headlights" },
  ToggleBuggyTurretButton: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Driving", label: "Enter/Exit Turret" },
  BuggyPrimaryFireButton: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Weapons", label: "SRV Primary Fire" },
  BuggySecondaryFireButton: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Weapons", label: "SRV Secondary Fire" },
  SelectTarget_Buggy: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Targeting", label: "SRV Target Ahead" },
  IncreaseEnginesPower_Buggy: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Power", label: "SRV Engines Pip" },
  IncreaseWeaponsPower_Buggy: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Power", label: "SRV Weapons Pip" },
  IncreaseSystemsPower_Buggy: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Power", label: "SRV Systems Pip" },
  ResetPowerDistribution_Buggy: { area: "SRV Controls", subContext: "SRV_Driving", category: "SRV Power", label: "SRV Reset Pips" },

  // --- ON FOOT CONTROLS (Odyssey) ---
  HumanoidForwardButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Locomotion", label: "Walk Forward" },
  HumanoidBackwardButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Locomotion", label: "Walk Backward" },
  HumanoidStrafeLeftButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Locomotion", label: "Strafe Left" },
  HumanoidStrafeRightButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Locomotion", label: "Strafe Right" },
  HumanoidSprintButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Locomotion", label: "Sprint" },
  HumanoidWalkButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Locomotion", label: "Walk (Slow)" },
  HumanoidCrouchButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Locomotion", label: "Crouch" },
  HumanoidJumpButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Locomotion", label: "Jump" },
  HumanoidPrimaryInteractButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Interaction", label: "Interact" },
  HumanoidSecondaryInteractButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Interaction", label: "Secondary Interact" },
  HumanoidPrimaryFireButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Combat", label: "Fire Weapon / Use Tool" },
  HumanoidZoomButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Combat", label: "Aim Down Sights (ADS)" },
  HumanoidThrowGrenadeButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Combat", label: "Throw Grenade" },
  HumanoidMeleeButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Combat", label: "Melee Attack" },
  HumanoidReloadButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Combat", label: "Reload" },
  HumanoidSwitchWeapon: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Combat", label: "Switch Weapon" },
  HumanoidSelectPrimaryWeaponButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Combat", label: "Select Primary Weapon" },
  HumanoidSelectSecondaryWeaponButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Combat", label: "Select Secondary Weapon" },
  HumanoidSelectUtilityWeaponButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Combat", label: "Select Utility Tool" },
  HumanoidHideWeaponButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Combat", label: "Holster Weapon" },
  HumanoidToggleFlashlightButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Suit", label: "Flashlight" },
  HumanoidToggleNightVisionButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Suit", label: "Suit Night Vision" },
  HumanoidToggleShieldsButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Suit", label: "Suit Shields" },
  HumanoidHealthPack: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Suit", label: "Medkit (Health Pack)" },
  HumanoidBattery: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Suit", label: "Energy Cell (Battery)" },
  HumanoidSwitchToRechargeTool: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Tools", label: "Energylink" },
  HumanoidSwitchToCompAnalyser: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Tools", label: "Profile Analyser" },
  HumanoidSwitchToSuitTool: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Tools", label: "Arc Cutter / Suit Tool" },
  HumanoidToggleToolModeButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Tools", label: "Toggle Tool Mode" },
  HumanoidItemWheelButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Wheels", label: "Item Wheel" },
  HumanoidEmoteWheelButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot Wheels", label: "Emote Wheel" },
  HumanoidOpenAccessPanelButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot UI", label: "Open Insight Hub" },
  HumanoidConflictContextualUIButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot UI", label: "Conflict Zone Stats" },
  HumanoidToggleMissionHelpPanelButton: { area: "On Foot Controls", subContext: "OnFoot", category: "On Foot UI", label: "Toggle Help" }
};

// Heuristic fallback for unmapped action tags
function inferActionMeta(tag) {
  let area = "General Controls";
  let subContext = "General";
  let category = "Miscellaneous";

  if (tag.startsWith("Humanoid")) {
    area = "On Foot Controls";
    subContext = "OnFoot";
    category = "On Foot";
  } else if (tag.includes("Buggy") || tag.includes("SRV")) {
    area = "SRV Controls";
    subContext = "SRV_Driving";
    category = "SRV";
  } else if (tag.startsWith("ExplorationFSS")) {
    area = "Ship Controls";
    subContext = "FSS";
    category = "Full Spectrum System Scanner";
  } else if (tag.startsWith("ExplorationSAA") || tag.startsWith("SAA")) {
    area = "Ship Controls";
    subContext = "DSS";
    category = "Detailed Surface Scanner";
  } else if (tag.startsWith("Cam") || tag.startsWith("Vanity") || tag.startsWith("FreeCam") || tag.includes("PlacementCam")) {
    area = "General Controls";
    subContext = "Camera";
    category = "Camera";
  } else if (tag.startsWith("UI_") || tag.startsWith("Focus")) {
    area = "General Controls";
    subContext = "UI";
    category = "Interface Mode";
  } else if (tag.includes("Thrust") || tag.includes("Pitch") || tag.includes("Roll") || tag.includes("Yaw") || tag.includes("Speed")) {
    area = "Ship Controls";
    subContext = "Flight";
    category = "Flight Controls";
  }

  // Convert CamelCase to readable words
  const label = tag
    .replace(/([A-Z])/g, " $1")
    .replace(/Button/g, "")
    .replace(/Toggle/g, " Toggle")
    .trim();

  return { area, subContext, category, label };
}

// -------------------------------------------------------------
// 2. Keyboard Layout Definition (ANSI 104-Key Standard)
// -------------------------------------------------------------
const KEYBOARD_LAYOUT = {
  main: [
    // Function Row
    [
      { code: "Key_Escape", label: "Esc" },
      { spacer: 1 },
      { code: "Key_F1", label: "F1" },
      { code: "Key_F2", label: "F2" },
      { code: "Key_F3", label: "F3" },
      { code: "Key_F4", label: "F4" },
      { spacer: 0.5 },
      { code: "Key_F5", label: "F5" },
      { code: "Key_F6", label: "F6" },
      { code: "Key_F7", label: "F7" },
      { code: "Key_F8", label: "F8" },
      { spacer: 0.5 },
      { code: "Key_F9", label: "F9" },
      { code: "Key_F10", label: "F10" },
      { code: "Key_F11", label: "F11" },
      { code: "Key_F12", label: "F12" },
    ],
    // Number Row
    [
      { code: "Key_Grave", label: "~" },
      { code: "Key_1", label: "1" },
      { code: "Key_2", label: "2" },
      { code: "Key_3", label: "3" },
      { code: "Key_4", label: "4" },
      { code: "Key_5", label: "5" },
      { code: "Key_6", label: "6" },
      { code: "Key_7", label: "7" },
      { code: "Key_8", label: "8" },
      { code: "Key_9", label: "9" },
      { code: "Key_0", label: "0" },
      { code: "Key_Minus", label: "-" },
      { code: "Key_Equals", label: "=" },
      { code: "Key_Backspace", label: "Backspace", class: "w-200" },
    ],
    // Tab / QWERTY Row
    [
      { code: "Key_Tab", label: "Tab", class: "w-150" },
      { code: "Key_Q", label: "Q" },
      { code: "Key_W", label: "W" },
      { code: "Key_E", label: "E" },
      { code: "Key_R", label: "R" },
      { code: "Key_T", label: "T" },
      { code: "Key_Y", label: "Y" },
      { code: "Key_U", label: "U" },
      { code: "Key_I", label: "I" },
      { code: "Key_O", label: "O" },
      { code: "Key_P", label: "P" },
      { code: "Key_LeftBracket", label: "[" },
      { code: "Key_RightBracket", label: "]" },
      { code: "Key_BackSlash", label: "\\", class: "w-150" },
    ],
    // Caps / Home Row
    [
      { code: "Key_CapsLock", label: "Caps", class: "w-175" },
      { code: "Key_A", label: "A" },
      { code: "Key_S", label: "S" },
      { code: "Key_D", label: "D" },
      { code: "Key_F", label: "F" },
      { code: "Key_G", label: "G" },
      { code: "Key_H", label: "H" },
      { code: "Key_J", label: "J" },
      { code: "Key_K", label: "K" },
      { code: "Key_L", label: "L" },
      { code: "Key_SemiColon", label: ";" },
      { code: "Key_Apostrophe", label: "'" },
      { code: "Key_Enter", label: "Enter", class: "w-225" },
    ],
    // Shift Row
    [
      { code: "Key_LeftShift", label: "Shift", class: "w-225" },
      { code: "Key_Z", label: "Z" },
      { code: "Key_X", label: "X" },
      { code: "Key_C", label: "C" },
      { code: "Key_V", label: "V" },
      { code: "Key_B", label: "B" },
      { code: "Key_N", label: "N" },
      { code: "Key_M", label: "M" },
      { code: "Key_Comma", label: "," },
      { code: "Key_Period", label: "." },
      { code: "Key_Slash", label: "/" },
      { code: "Key_RightShift", label: "Shift", class: "w-275" },
    ],
    // Bottom Row
    [
      { code: "Key_LeftControl", label: "Ctrl", class: "w-125" },
      { code: "Key_LeftWin", label: "Win", class: "w-125" },
      { code: "Key_LeftAlt", label: "Alt", class: "w-125" },
      { code: "Key_Space", label: "Space", class: "w-space" },
      { code: "Key_RightAlt", label: "Alt", class: "w-125" },
      { code: "Key_RightWin", label: "Win", class: "w-125" },
      { code: "Key_Apps", label: "Menu", class: "w-125" },
      { code: "Key_RightControl", label: "Ctrl", class: "w-125" },
    ],
  ],

  // Navigation Cluster (6-Key & Arrows)
  nav: [
    [
      { code: "Key_SYSRQ", label: "PrtSc" },
      { code: "Key_ScrollLock", label: "Scroll" },
      { code: "Key_Pause", label: "Pause" },
    ],
    [
      { code: "Key_Insert", label: "Ins" },
      { code: "Key_Home", label: "Home" },
      { code: "Key_PageUp", label: "PgUp" },
    ],
    [
      { code: "Key_Delete", label: "Del" },
      { code: "Key_End", label: "End" },
      { code: "Key_PageDown", label: "PgDn" },
    ],
    [
      { spacer: 1 },
      { spacer: 1 },
      { spacer: 1 },
    ],
    [
      { spacer: 1 },
      { code: "Key_UpArrow", label: "▲" },
      { spacer: 1 },
    ],
    [
      { code: "Key_LeftArrow", label: "◄" },
      { code: "Key_DownArrow", label: "▼" },
      { code: "Key_RightArrow", label: "►" },
    ],
  ],

  // Numpad Cluster
  numpad: [
    [
      { spacer: 1 }, { spacer: 1 }, { spacer: 1 }, { spacer: 1 }
    ],
    [
      { code: "Key_NumLock", label: "Num" },
      { code: "Key_Numpad_Divide", label: "/" },
      { code: "Key_Numpad_Multiply", label: "*" },
      { code: "Key_Numpad_Subtract", label: "-" },
    ],
    [
      { code: "Key_Numpad_7", label: "7" },
      { code: "Key_Numpad_8", label: "8" },
      { code: "Key_Numpad_9", label: "9" },
      { code: "Key_Numpad_Add", label: "+", class: "h-200" },
    ],
    [
      { code: "Key_Numpad_4", label: "4" },
      { code: "Key_Numpad_5", label: "5" },
      { code: "Key_Numpad_6", label: "6" },
    ],
    [
      { code: "Key_Numpad_1", label: "1" },
      { code: "Key_Numpad_2", label: "2" },
      { code: "Key_Numpad_3", label: "3" },
      { code: "Key_Numpad_Enter", label: "Enter", class: "h-200" },
    ],
    [
      { code: "Key_Numpad_0", label: "0", class: "w-200" },
      { code: "Key_Numpad_Decimal", label: "." },
    ],
  ],
};

// Standard ANSI Key list for Free-Key Matrix
const ALL_STANDARD_KEYS = [
  "Key_Escape", "Key_F1", "Key_F2", "Key_F3", "Key_F4", "Key_F5", "Key_F6", "Key_F7", "Key_F8", "Key_F9", "Key_F10", "Key_F11", "Key_F12",
  "Key_Grave", "Key_1", "Key_2", "Key_3", "Key_4", "Key_5", "Key_6", "Key_7", "Key_8", "Key_9", "Key_0", "Key_Minus", "Key_Equals", "Key_Backspace",
  "Key_Tab", "Key_Q", "Key_W", "Key_E", "Key_R", "Key_T", "Key_Y", "Key_U", "Key_I", "Key_O", "Key_P", "Key_LeftBracket", "Key_RightBracket", "Key_BackSlash",
  "Key_CapsLock", "Key_A", "Key_S", "Key_D", "Key_F", "Key_G", "Key_H", "Key_J", "Key_K", "Key_L", "Key_SemiColon", "Key_Apostrophe", "Key_Enter",
  "Key_LeftShift", "Key_Z", "Key_X", "Key_C", "Key_V", "Key_B", "Key_N", "Key_M", "Key_Comma", "Key_Period", "Key_Slash", "Key_RightShift",
  "Key_LeftControl", "Key_LeftAlt", "Key_Space", "Key_RightAlt", "Key_RightControl",
  "Key_Insert", "Key_Home", "Key_PageUp", "Key_Delete", "Key_End", "Key_PageDown",
  "Key_UpArrow", "Key_LeftArrow", "Key_DownArrow", "Key_RightArrow",
  "Key_NumLock", "Key_Numpad_Divide", "Key_Numpad_Multiply", "Key_Numpad_Subtract",
  "Key_Numpad_7", "Key_Numpad_8", "Key_Numpad_9", "Key_Numpad_Add",
  "Key_Numpad_4", "Key_Numpad_5", "Key_Numpad_6",
  "Key_Numpad_1", "Key_Numpad_2", "Key_Numpad_3", "Key_Numpad_Enter",
  "Key_Numpad_0", "Key_Numpad_Decimal"
];

// Browser Event.code to Elite Key Code mapping
const CODE_TO_ELITE_KEY = {
  Escape: "Key_Escape",
  F1: "Key_F1", F2: "Key_F2", F3: "Key_F3", F4: "Key_F4",
  F5: "Key_F5", F6: "Key_F6", F7: "Key_F7", F8: "Key_F8",
  F9: "Key_F9", F10: "Key_F10", F11: "Key_F11", F12: "Key_F12",
  Backquote: "Key_Grave",
  Digit1: "Key_1", Digit2: "Key_2", Digit3: "Key_3", Digit4: "Key_4", Digit5: "Key_5",
  Digit6: "Key_6", Digit7: "Key_7", Digit8: "Key_8", Digit9: "Key_9", Digit0: "Key_0",
  Minus: "Key_Minus", Equal: "Key_Equals", Backspace: "Key_Backspace",
  Tab: "Key_Tab",
  KeyQ: "Key_Q", KeyW: "Key_W", KeyE: "Key_E", KeyR: "Key_R", KeyT: "Key_T",
  KeyY: "Key_Y", KeyU: "Key_U", KeyI: "Key_I", KeyO: "Key_O", KeyP: "Key_P",
  BracketLeft: "Key_LeftBracket", BracketRight: "Key_RightBracket", Backslash: "Key_BackSlash",
  CapsLock: "Key_CapsLock",
  KeyA: "Key_A", KeyS: "Key_S", KeyD: "Key_D", KeyF: "Key_F", KeyG: "Key_G",
  KeyH: "Key_H", KeyJ: "Key_J", KeyK: "Key_K", KeyL: "Key_L",
  Semicolon: "Key_SemiColon", Quote: "Key_Apostrophe", Enter: "Key_Enter",
  ShiftLeft: "Key_LeftShift", ShiftRight: "Key_RightShift",
  KeyZ: "Key_Z", KeyX: "Key_X", KeyC: "Key_C", KeyV: "Key_V", KeyB: "Key_B",
  KeyN: "Key_N", KeyM: "Key_M",
  Comma: "Key_Comma", Period: "Key_Period", Slash: "Key_Slash",
  ControlLeft: "Key_LeftControl", ControlRight: "Key_RightControl",
  AltLeft: "Key_LeftAlt", AltRight: "Key_RightAlt",
  Space: "Key_Space",
  Insert: "Key_Insert", Home: "Key_Home", PageUp: "Key_PageUp",
  Delete: "Key_Delete", End: "Key_End", PageDown: "Key_PageDown",
  ArrowUp: "Key_UpArrow", ArrowLeft: "Key_LeftArrow", ArrowDown: "Key_DownArrow", ArrowRight: "Key_RightArrow",
  NumLock: "Key_NumLock", NumpadDivide: "Key_Numpad_Divide", NumpadMultiply: "Key_Numpad_Multiply", NumpadSubtract: "Key_Numpad_Subtract",
  Numpad7: "Key_Numpad_7", Numpad8: "Key_Numpad_8", Numpad9: "Key_Numpad_9", NumpadAdd: "Key_Numpad_Add",
  Numpad4: "Key_Numpad_4", Numpad5: "Key_Numpad_5", Numpad6: "Key_Numpad_6",
  Numpad1: "Key_Numpad_1", Numpad2: "Key_Numpad_2", Numpad3: "Key_Numpad_3", NumpadEnter: "Key_Numpad_Enter",
  Numpad0: "Key_Numpad_0", NumpadDecimal: "Key_Numpad_Decimal"
};

// -------------------------------------------------------------
// 3. Application State
// -------------------------------------------------------------
const state = {
  currentView: "visualizer",
  activeDiagTab: "conflicts",
  activeContext: "Ship Controls",
  modifierFilter: "ALL",
  searchQuery: "",
  layoutMode: "ANSI-104",

  // Parsed Bindings
  bindingsList: [],        // array of all parsed action bindings
  byKey: {},               // Key_W -> Array of bindings
  byChord: {},             // Key_LeftShift+Key_W -> Array of bindings

  // Diagnostic Results
  fatalConflicts: [],      // clashes in identical active sub-context
  safeCoexistence: [],     // multi-context shared bindings
  freeKeys: [],            // completely unbound standard keys

  // Companion Live WebSocket
  ws: null,
  activeKeyHoldTimer: null,
};

// -------------------------------------------------------------
// 4. XML Binds Parser
// -------------------------------------------------------------
function parseBindsXml(xmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");
  const root = doc.documentElement;

  const bindings = [];
  const byKey = {};
  const byChord = {};

  const nodes = root.children;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const actionTag = node.tagName;

    // Check for Primary and Secondary keyboard slots
    const slots = [
      { el: node.querySelector("Primary"), slot: "Primary" },
      { el: node.querySelector("Secondary"), slot: "Secondary" }
    ];

    for (const { el, slot } of slots) {
      if (!el) continue;
      const device = el.getAttribute("Device");
      const key = el.getAttribute("Key");

      if (device === "Keyboard" && key) {
        // Collect modifiers
        const modEls = el.querySelectorAll("Modifier");
        const modifiers = [];
        modEls.forEach(m => {
          const modKey = m.getAttribute("Key");
          if (modKey) modifiers.push(modKey);
        });

        // Resolve meta
        const meta = ACTION_REGISTRY[actionTag] || inferActionMeta(actionTag);

        // Sort modifiers for canonical chord string
        const sortedMods = [...modifiers].sort();
        const chordKey = sortedMods.length ? `${sortedMods.join("+")}+${key}` : key;

        const entry = {
          actionCode: actionTag,
          label: meta.label,
          area: meta.area,
          subContext: meta.subContext,
          category: meta.category,
          slot,
          key,
          modifiers: sortedMods,
          chordKey
        };

        bindings.push(entry);

        if (!byKey[key]) byKey[key] = [];
        byKey[key].push(entry);

        if (!byChord[chordKey]) byChord[chordKey] = [];
        byChord[chordKey].push(entry);
      }
    }
  }

  state.bindingsList = bindings;
  state.byKey = byKey;
  state.byChord = byChord;

  runDiagnostics();
  renderKeyboard();
  updateDiagnosticUI();
}

// -------------------------------------------------------------
// 5. Context-Aware Conflict & Free Keys Engine
// -------------------------------------------------------------
function runDiagnostics() {
  const fatal = [];
  const safe = [];

  // Group by chord
  for (const chord in state.byChord) {
    const list = state.byChord[chord];
    if (list.length <= 1) continue;

    // Check sub-contexts
    // True conflict occurs when 2+ actions share chord inside the SAME active subContext
    const subContextGroups = {};
    for (const b of list) {
      const sub = b.subContext || "General";
      if (!subContextGroups[sub]) subContextGroups[sub] = [];
      subContextGroups[sub].push(b);
    }

    let isFatal = false;
    for (const sub in subContextGroups) {
      const group = subContextGroups[sub];
      if (group.length > 1) {
        // Double check: if both are same action (e.g. Primary & Secondary set to same key), ignore
        const uniqueActions = new Set(group.map(x => x.actionCode));
        if (uniqueActions.size > 1) {
          isFatal = true;
          fatal.push({
            chord,
            subContext: sub,
            area: group[0].area,
            actions: group,
            uniqueActionCount: uniqueActions.size
          });
        }
      }
    }

    if (!isFatal) {
      safe.push({
        chord,
        actions: list,
        areas: Array.from(new Set(list.map(x => x.area)))
      });
    }
  }

  // Free Keys calculation
  const freeKeys = ALL_STANDARD_KEYS.filter(k => !state.byKey[k] || state.byKey[k].length === 0);

  state.fatalConflicts = fatal;
  state.safeCoexistence = safe;
  state.freeKeys = freeKeys;

  // Update badge on header
  const badge = document.getElementById("fatal-badge-count");
  if (badge) {
    badge.textContent = fatal.length;
    badge.style.display = fatal.length > 0 ? "inline-block" : "none";
  }
}

// -------------------------------------------------------------
// 6. Keyboard Visualizer Renderer
// -------------------------------------------------------------
function renderKeyboard() {
  renderBlock("kb-main-block", KEYBOARD_LAYOUT.main);
  renderBlock("kb-nav-block", KEYBOARD_LAYOUT.nav);
  renderBlock("kb-numpad-block", KEYBOARD_LAYOUT.numpad);
}

function renderBlock(containerId, rows) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  for (const row of rows) {
    const rowEl = document.createElement("div");
    rowEl.className = "kb-row";

    for (const k of row) {
      if (k.spacer) {
        const spacerEl = document.createElement("div");
        spacerEl.style.width = `${k.spacer * 54}px`;
        rowEl.appendChild(spacerEl);
        continue;
      }

      const keycap = document.createElement("div");
      keycap.id = `kc-${k.code}`;
      keycap.className = `keycap ${k.class || ""}`;

      const boundActions = state.byKey[k.code] || [];
      const hasBinding = boundActions.length > 0;
      if (hasBinding) keycap.classList.add("has-binding");

      // Check if this key has a fatal conflict
      const isConflicted = state.fatalConflicts.some(f => f.actions.some(a => a.key === k.code));
      if (isConflicted) keycap.classList.add("conflicted");

      // Find action matching current context & modifier filters
      const filteredAction = findDisplayActionForKey(k.code);

      // Modifier dots
      const hasShift = boundActions.some(a => a.modifiers.some(m => m.includes("Shift")));
      const hasCtrl = boundActions.some(a => a.modifiers.some(m => m.includes("Control")));
      const hasAlt = boundActions.some(a => a.modifiers.some(m => m.includes("Alt")));

      keycap.innerHTML = `
        <div class="key-header">
          <span class="key-label">${k.label}</span>
          <div class="key-modifiers">
            ${hasShift ? '<span class="mod-dot shift" title="Shift Chord"></span>' : ''}
            ${hasCtrl ? '<span class="mod-dot ctrl" title="Ctrl Chord"></span>' : ''}
            ${hasAlt ? '<span class="mod-dot alt" title="Alt Chord"></span>' : ''}
          </div>
        </div>
        <div class="key-action" title="${filteredAction ? filteredAction.label : ''}">
          ${filteredAction ? filteredAction.label : ''}
        </div>
        <div class="key-tooltip">
          <div class="tt-title">${k.label} (${k.code})</div>
          ${boundActions.length === 0 ? '<div style="color:var(--hud-green); font-size:11px;">[Unbound Key - Free to Assign]</div>' : ''}
          ${boundActions.map(b => `
            <div class="tt-item">
              <span class="tt-area">${b.area} › ${b.category}</span>
              <span class="tt-act">${b.modifiers.length ? `[${b.modifiers.map(formatModName).join("+")}] + ` : ""}${b.label}</span>
            </div>
          `).join("")}
        </div>
      `;

      // Click to inspect in telemetry banner
      keycap.addEventListener("click", () => {
        triggerKeyVisual(k.code, [], true);
      });

      rowEl.appendChild(keycap);
    }

    container.appendChild(rowEl);
  }
}

function findDisplayActionForKey(keyCode) {
  const actions = state.byKey[keyCode] || [];
  if (!actions.length) return null;

  // Filter by active context
  let matches = actions;
  if (state.activeContext !== "ALL") {
    matches = matches.filter(a => a.area === state.activeContext);
  }

  // Filter by modifier
  if (state.modifierFilter === "NONE") {
    matches = matches.filter(a => a.modifiers.length === 0);
  } else if (state.modifierFilter === "SHIFT") {
    matches = matches.filter(a => a.modifiers.some(m => m.includes("Shift")));
  } else if (state.modifierFilter === "CTRL") {
    matches = matches.filter(a => a.modifiers.some(m => m.includes("Control")));
  } else if (state.modifierFilter === "ALT") {
    matches = matches.filter(a => a.modifiers.some(m => m.includes("Alt")));
  }

  // Filter by search query
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    matches = matches.filter(a => a.label.toLowerCase().includes(q) || a.actionCode.toLowerCase().includes(q));
  }

  return matches[0] || null;
}

function formatModName(m) {
  if (m === "Key_LeftShift") return "L-Shift";
  if (m === "Key_RightShift") return "R-Shift";
  if (m === "Key_LeftControl") return "L-Ctrl";
  if (m === "Key_RightControl") return "R-Ctrl";
  if (m === "Key_LeftAlt") return "L-Alt";
  if (m === "Key_RightAlt") return "R-Alt";
  return m.replace("Key_", "");
}

// -------------------------------------------------------------
// 7. Live Key Telemetry & Effect Highlighting
// -------------------------------------------------------------
function triggerKeyVisual(eliteKey, modifiers = [], keepAlive = false) {
  // Highlight Keycap
  const keycap = document.getElementById(`kc-${eliteKey}`);
  if (keycap) {
    keycap.classList.add("pressed");
    if (!keepAlive) {
      setTimeout(() => keycap.classList.remove("pressed"), 300);
    }
  }

  // Build canonical chord string
  const sortedMods = [...modifiers].sort();
  const chordKey = sortedMods.length ? `${sortedMods.join("+")}+${eliteKey}` : eliteKey;

  // Resolve mapped actions for this chord
  const chordBindings = state.byChord[chordKey] || [];
  const directKeyBindings = state.byKey[eliteKey] || [];

  // Update Telemetry Banner
  const banner = document.getElementById("telemetry-banner");
  const chordBadge = document.getElementById("telemetry-chord");
  const titleEl = document.getElementById("telemetry-action-title");
  const subEl = document.getElementById("telemetry-action-sub");
  const contextsEl = document.getElementById("telemetry-contexts");

  if (!banner || !chordBadge) return;

  banner.classList.add("active-chord");
  clearTimeout(state.activeKeyHoldTimer);
  state.activeKeyHoldTimer = setTimeout(() => banner.classList.remove("active-chord"), 3000);

  // Format chord text
  const modText = sortedMods.map(formatModName).join(" + ");
  const cleanKey = eliteKey.replace("Key_", "");
  chordBadge.textContent = modText ? `[ ${modText} ] + [ ${cleanKey} ]` : `[ ${cleanKey} ]`;

  // Find action in active context
  const primaryInContext = chordBindings.find(b => state.activeContext === "ALL" || b.area === state.activeContext);

  if (primaryInContext) {
    titleEl.textContent = `▶ ${primaryInContext.label.toUpperCase()}`;
    titleEl.style.color = "var(--hud-orange-bright)";
    subEl.textContent = `Context: ${primaryInContext.area} (${primaryInContext.category}) | Slot: ${primaryInContext.slot}`;
  } else if (chordBindings.length > 0) {
    titleEl.textContent = `▶ ${chordBindings[0].label.toUpperCase()}`;
    titleEl.style.color = "var(--hud-cyan)";
    subEl.textContent = `Context: ${chordBindings[0].area} (${chordBindings[0].category}) | (Inactive in ${state.activeContext})`;
  } else if (directKeyBindings.length > 0) {
    titleEl.textContent = `[ Chord Unbound ]`;
    titleEl.style.color = "var(--text-muted)";
    subEl.textContent = `Physical key has ${directKeyBindings.length} binding(s) in other chords`;
  } else {
    titleEl.textContent = `[ Completely Unassigned Key ]`;
    titleEl.style.color = "var(--hud-green)";
    subEl.textContent = `Ready for new custom keybind in Elite Dangerous settings`;
  }

  // Populate contextual chips
  contextsEl.innerHTML = "";
  const allRelated = chordBindings.length ? chordBindings : directKeyBindings;
  const uniqueAreas = Array.from(new Set(allRelated.map(b => `${b.area}: ${b.label}`)));

  uniqueAreas.slice(0, 4).forEach(item => {
    const chip = document.createElement("span");
    chip.className = "context-mini-chip bound";
    chip.textContent = item;
    contextsEl.appendChild(chip);
  });
}

function releaseKeyVisual(eliteKey) {
  const keycap = document.getElementById(`kc-${eliteKey}`);
  if (keycap) keycap.classList.remove("pressed");
}

// -------------------------------------------------------------
// 8. In-Browser Keyboard Event Fallback (when tab is focused)
// -------------------------------------------------------------
window.addEventListener("keydown", (e) => {
  // Prevent default scrolling on space / arrows when visualizer is focused
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code) && e.target === document.body) {
    e.preventDefault();
  }

  const eliteKey = CODE_TO_ELITE_KEY[e.code];
  if (!eliteKey) return;

  const mods = [];
  if (e.shiftKey && !eliteKey.includes("Shift")) mods.push("Key_LeftShift");
  if (e.ctrlKey && !eliteKey.includes("Control")) mods.push("Key_LeftControl");
  if (e.altKey && !eliteKey.includes("Alt")) mods.push("Key_LeftAlt");

  triggerKeyVisual(eliteKey, mods);
});

window.addEventListener("keyup", (e) => {
  const eliteKey = CODE_TO_ELITE_KEY[e.code];
  if (eliteKey) releaseKeyVisual(eliteKey);
});

// -------------------------------------------------------------
// 9. Diagnostic Studio UI
// -------------------------------------------------------------
function updateDiagnosticUI() {
  // Metric counts
  document.getElementById("metric-total-bindings").textContent = state.bindingsList.length;
  document.getElementById("metric-fatal-conflicts").textContent = state.fatalConflicts.length;
  document.getElementById("metric-safe-coexistence").textContent = state.safeCoexistence.length;
  document.getElementById("metric-free-keys").textContent = state.freeKeys.length;

  document.getElementById("count-fatal-tab").textContent = state.fatalConflicts.length;
  document.getElementById("count-safe-tab").textContent = state.safeCoexistence.length;
  document.getElementById("count-free-tab").textContent = state.freeKeys.length;

  // Render Conflicts list
  const conflictList = document.getElementById("diag-content-conflicts");
  if (conflictList) {
    if (state.fatalConflicts.length === 0) {
      conflictList.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--hud-green); font-size: 16px;">
        ✅ <strong>No Fatal Conflicts Detected!</strong> All mapped chords are cleanly isolated across your control contexts.
      </div>`;
    } else {
      conflictList.innerHTML = state.fatalConflicts.map(fc => `
        <div class="conflict-card">
          <div class="conflict-key-col">
            <span class="conflict-key-name">${fc.chord.replace(/Key_/g, "")}</span>
            <span class="conflict-badge fatal">FATAL CLASH</span>
          </div>
          <div class="conflict-actions-col">
            <div style="font-size: 12px; color: var(--hud-red); font-weight: bold; margin-bottom: 2px;">
              Active in identical state: [${fc.area} › ${fc.subContext}]
            </div>
            ${fc.actions.map(a => `
              <div class="action-row">
                <span class="action-cat-pill">${a.category}</span>
                <span style="font-weight: 700; color: #fff;">${a.label}</span>
                <span style="font-size: 11px; color: var(--text-muted);">(${a.actionCode})</span>
              </div>
            `).join("")}
          </div>
          <div class="conflict-tip">
            💡 <em>Pressing this key triggers multiple simultaneous actions! Rebind one command to an unassigned key.</em>
          </div>
        </div>
      `).join("");
    }
  }

  // Render Safe Coexistence list
  const safeList = document.getElementById("diag-content-coexistence");
  if (safeList) {
    safeList.innerHTML = state.safeCoexistence.map(sc => `
      <div class="conflict-card safe">
        <div class="conflict-key-col">
          <span class="conflict-key-name">${sc.chord.replace(/Key_/g, "")}</span>
          <span class="conflict-badge safe">SAFE SHARING</span>
        </div>
        <div class="conflict-actions-col">
          <div style="font-size: 12px; color: var(--hud-green); margin-bottom: 4px;">
            Shared across ${sc.areas.length} exclusive states: ${sc.areas.join(" | ")}
          </div>
          ${sc.actions.map(a => `
            <div class="action-row">
              <span class="action-cat-pill">${a.area} › ${a.category}</span>
              <span style="font-weight: 600; color: #fff;">${a.label}</span>
            </div>
          `).join("")}
        </div>
        <div class="conflict-tip" style="color: var(--hud-green);">
          ✔ Permitted: States never execute concurrently.
        </div>
      </div>
    `).join("");
  }

  // Render Free Keys Grid
  const freeGrid = document.getElementById("diag-content-free");
  if (freeGrid) {
    freeGrid.innerHTML = state.freeKeys.map(k => `
      <div class="free-key-card" onclick="copyKeyToClipboard('${k}')">
        <span class="free-key-name">${k.replace("Key_", "")}</span>
        <span class="free-key-status">AVAILABLE</span>
      </div>
    `).join("");
  }
}

function copyKeyToClipboard(keyName) {
  navigator.clipboard.writeText(keyName.replace("Key_", ""));
  triggerKeyVisual(keyName);
  alert(`Key '${keyName.replace("Key_", "")}' copied to clipboard! You can bind it in Elite Dangerous.`);
}

// -------------------------------------------------------------
// 10. Header & Tab Navigation
// -------------------------------------------------------------
window.switchView = function (viewName) {
  state.currentView = viewName;
  try {
    localStorage.setItem("edtools_active_tab", viewName);
  } catch (e) {
    console.warn("Could not save active tab to localStorage", e);
  }

  document.getElementById("tab-visualizer")?.classList.toggle("active", viewName === "visualizer");
  document.getElementById("tab-diagnostic")?.classList.toggle("active", viewName === "diagnostic");
  document.getElementById("tab-colonize")?.classList.toggle("active", viewName === "colonize");
  document.getElementById("tab-settings")?.classList.toggle("active", viewName === "settings");

  document.getElementById("view-visualizer")?.classList.toggle("hidden", viewName !== "visualizer");
  document.getElementById("view-diagnostic")?.classList.toggle("hidden", viewName !== "diagnostic");
  document.getElementById("view-colonize")?.classList.toggle("hidden", viewName !== "colonize");
  document.getElementById("view-settings")?.classList.toggle("hidden", viewName !== "settings");

  const controlBar = document.querySelector(".control-bar");
  if (controlBar) {
    (controlBar as HTMLElement).style.display = (viewName === "colonize" || viewName === "settings") ? "none" : "flex";
  }
};

window.switchDiagTab = function (tabName) {
  state.activeDiagTab = tabName;
  try {
    localStorage.setItem("edtools_active_diag_tab", tabName);
  } catch (e) {}

  document.getElementById("diag-btn-conflicts")?.classList.toggle("active", tabName === "conflicts");
  document.getElementById("diag-btn-coexistence")?.classList.toggle("active", tabName === "coexistence");
  document.getElementById("diag-btn-free")?.classList.toggle("active", tabName === "free");

  document.getElementById("diag-content-conflicts")?.classList.toggle("hidden", tabName !== "conflicts");
  document.getElementById("diag-content-coexistence")?.classList.toggle("hidden", tabName !== "coexistence");
  document.getElementById("diag-content-free")?.classList.toggle("hidden", tabName !== "free");
};

function restoreTabState() {
  try {
    const savedTab = localStorage.getItem("edtools_active_tab");
    if (savedTab && ["visualizer", "diagnostic", "colonize", "settings"].includes(savedTab)) {
      window.switchView(savedTab);
    }
    const savedDiagTab = localStorage.getItem("edtools_active_diag_tab");
    if (savedDiagTab && ["conflicts", "coexistence", "free"].includes(savedDiagTab)) {
      window.switchDiagTab(savedDiagTab);
    }
  } catch (e) {
    console.warn("Error restoring tab state:", e);
  }
}
restoreTabState();

window.onContextChanged = function () {
  state.activeContext = document.getElementById("context-select").value;
  renderKeyboard();
};

window.onModifierFilterChanged = function () {
  state.modifierFilter = document.getElementById("mod-filter-select").value;
  renderKeyboard();
};

window.onSearchChanged = function () {
  state.searchQuery = document.getElementById("action-search").value;
  renderKeyboard();
};

window.onLayoutChanged = function () {
  state.layoutMode = document.getElementById("layout-select").value;
  const numpad = document.getElementById("kb-numpad-block");
  if (numpad) {
    numpad.style.display = state.layoutMode === "TKL-87" ? "none" : "flex";
  }
};

// -------------------------------------------------------------
// 11. WebSocket Connection to Bun Companion Server
// -------------------------------------------------------------
function initCompanionConnection() {
  const connPill = document.getElementById("connection-status");
  const connText = document.getElementById("connection-text");

  const wsUrl = `ws://${window.location.host}/ws`;
  console.log(`[EDTools] Attempting connection to companion stream at ${wsUrl}...`);

  try {
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`[EDTools] Connected to Companion Server!`);
      connPill.className = "connection-pill";
      connText.textContent = "COMPANION ACTIVE (LIVE IN-GAME TELEMETRY)";
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "connected" || msg.type === "bindsUpdated") {
          console.log(`[EDTools] Received binds update: ${msg.filename}`);
          document.getElementById("current-file-label").textContent = msg.filename;
          if (msg.xml) parseBindsXml(msg.xml);
        } else if (msg.type === "keyEvent") {
          if (msg.event === "keydown") {
            triggerKeyVisual(msg.key, msg.modifiers || []);
          } else if (msg.event === "keyup") {
            releaseKeyVisual(msg.key);
          }
        }

        // Forward all WebSocket events to window listeners (e.g. Colonisation scout)
        window.dispatchEvent(new CustomEvent("edtools:ws", { detail: msg }));
      } catch (err) {
        console.error(`[EDTools] Error processing WebSocket message:`, err);
      }
    };

    ws.onclose = () => {
      connPill.className = "connection-pill disconnected";
      connText.textContent = "BROWSER ONLY (START START.BAT FOR LIVE IN-GAME)";
      setTimeout(initCompanionConnection, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    state.ws = ws;
  } catch (e) {
    console.warn(`[EDTools] Companion server not running, using in-browser mode.`);
  }
}

// -------------------------------------------------------------
// 12. Local File Loading & Default 4.2 Presets
// -------------------------------------------------------------
document.getElementById("file-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  document.getElementById("current-file-label").textContent = file.name;
  const reader = new FileReader();
  reader.onload = (event) => {
    parseBindsXml(event.target.result);
  };
  reader.readAsText(file);
});

window.loadDefault42Binds = async function () {
  try {
    const resp = await fetch("/api/binds");
    if (resp.ok) {
      const data = await resp.json();
      document.getElementById("current-file-label").textContent = data.filename;
      parseBindsXml(data.xml);
      return;
    }
  } catch (err) {
    // server not present
  }
};

// -------------------------------------------------------------
// App Initialization
// -------------------------------------------------------------
window.addEventListener("DOMContentLoaded", async () => {
  restoreTabState();
  renderKeyboard();
  initCompanionConnection();

  // Try fetching current binds from companion API
  try {
    const res = await fetch("/api/binds");
    if (res.ok) {
      const data = await res.json();
      document.getElementById("current-file-label").textContent = data.filename;
      if (data.xml) parseBindsXml(data.xml);
    }
  } catch {
    console.log("[EDTools] Running standalone without server.");
  }
});
