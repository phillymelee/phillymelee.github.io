// getStyles.ts

import BowserIcon from "../assets/characters/bowser_default.png";
import DkIcon from "../assets/characters/dk_default.png";
import DocIcon from "../assets/characters/doc_default.png";
import FalcoIcon from "../assets/characters/falco_default.png";
import FalconIcon from "../assets/characters/falcon_default.png";
import FoxIcon from "../assets/characters/fox_default.png";
import GanonIcon from "../assets/characters/ganon_default.png";
import GnwIcon from "../assets/characters/gnw_default.png";
import IcsIcon from "../assets/characters/ics_default.png";
import KirbyIcon from "../assets/characters/kirby_default.png";
import LinkIcon from "../assets/characters/link_default.png";
import LuigiIcon from "../assets/characters/luigi_default.png";
import MarioIcon from "../assets/characters/mario_default.png";
import MarthIcon from "../assets/characters/marth_default.png";
import MewtwoIcon from "../assets/characters/mewtwo_default.png";
import NessIcon from "../assets/characters/ness_default.png";
import PeachIcon from "../assets/characters/peach_default.png";
import PichuIcon from "../assets/characters/pichu_default.png";
import PikachuIcon from "../assets/characters/pikachu_default.png";
import PuffIcon from "../assets/characters/puff_default.png";
import RoyIcon from "../assets/characters/roy_default.png";
import SamusIcon from "../assets/characters/samus_default.png";
import SheikIcon from "../assets/characters/sheik_default.png";
import YounglinkIcon from "../assets/characters/yl_default.png";
import YoshiIcon from "../assets/characters/yoshi_default.png";
import ZeldaIcon from "../assets/characters/zelda_default.png";
import UnknownIcon from "../assets/characters/unknown.png";
import FudgeIcon from "../assets/characters/FUDGE.jpg";

import GrandMasterIcon from "../assets/ranks/GrandMaster.svg";
import Master1Icon from "../assets/ranks/MasterI.svg";
import Master2Icon from "../assets/ranks/MasterII.svg";
// import Master3Icon from "../assets/ranks/MasterIII.svg";
import Diamond1Icon from "../assets/ranks/DiamondI.svg";
import Diamond2Icon from "../assets/ranks/DiamondII.svg";
import Diamond3Icon from "../assets/ranks/DiamondIII.svg";
import Platinum3Icon from "../assets/ranks/PlatinumIII.svg";
import Platinum2Icon from "../assets/ranks/PlatinumII.svg";
import Platinum1Icon from "../assets/ranks/PlatinumI.svg";
import Gold3Icon from "../assets/ranks/GoldIII.svg";
import Gold2Icon from "../assets/ranks/GoldII.svg";
import Gold1Icon from "../assets/ranks/GoldI.svg";
import Silver3Icon from "../assets/ranks/SilverIII.svg";
import Silver2Icon from "../assets/ranks/SilverII.svg";
import Silver1Icon from "../assets/ranks/SilverI.svg";
import Bronze3Icon from "../assets/ranks/BronzeIII.svg";
import Bronze2Icon from "../assets/ranks/BronzeII.svg";
import Bronze1Icon from "../assets/ranks/BronzeI.svg";
import PendingIcon from "../assets/ranks/Pending.svg";

export function getCharacterImage(character: string) {
    return characterNameToIcon.get(character) ?? UnknownIcon;
}

export function getRankIcon(rank: string) {
    return rankNameToIcon.get(rank) ?? PendingIcon;
}

export function getRankClass(elo: number): string {
    if (elo < 1055) return "bronze";
    if (elo < 1436) return "silver";
    if (elo < 1752) return "gold";
    if (elo < 2004) return "plat";
    if (elo < 2192) return "diamond";
    return "master";
}

const characterNameToIcon = new Map([
    ["BOWSER", BowserIcon],
    ["CAPTAIN_FALCON", FalconIcon],
    ["DONKEY_KONG", DkIcon],
    ["DR_MARIO", DocIcon],
    ["FALCO", FalcoIcon],
    ["FOX", FoxIcon],
    ["GAME_AND_WATCH", GnwIcon],
    ["GANONDORF", GanonIcon],
    ["ICE_CLIMBERS", IcsIcon],
    ["KIRBY", KirbyIcon],
    ["LINK", LinkIcon],
    ["LUIGI", LuigiIcon],
    ["MARIO", MarioIcon],
    ["MARTH", MarthIcon],
    ["MEWTWO", MewtwoIcon],
    ["NESS", NessIcon],
    ["PEACH", PeachIcon],
    ["PICHU", PichuIcon],
    ["PIKACHU", PikachuIcon],
    ["JIGGLYPUFF", PuffIcon],
    ["ROY", RoyIcon],
    ["SAMUS", SamusIcon],
    ["SHEIK", SheikIcon],
    ["YOSHI", YoshiIcon],
    ["YOUNG_LINK", YounglinkIcon],
    ["ZELDA", ZeldaIcon],
    ["FUDGE", FudgeIcon]
]);

const rankNameToIcon = new Map([
    ["Bronze 1", Bronze1Icon],
    ["Bronze 2", Bronze2Icon],
    ["Bronze 3", Bronze3Icon],
    ["Silver 1", Silver1Icon],
    ["Silver 2", Silver2Icon],
    ["Silver 3", Silver3Icon],
    ["Gold 1", Gold1Icon],
    ["Gold 2", Gold2Icon],
    ["Gold 3", Gold3Icon],
    ["Platinum 1", Platinum1Icon],
    ["Platinum 2", Platinum2Icon],
    ["Platinum 3", Platinum3Icon],
    ["Diamond 1", Diamond1Icon],
    ["Diamond 2", Diamond2Icon],
    ["Diamond 3", Diamond3Icon],
    ["Master 1", Master1Icon],
    ["Master 2", Master2Icon],
    ["Grandmaster", GrandMasterIcon]
]);
