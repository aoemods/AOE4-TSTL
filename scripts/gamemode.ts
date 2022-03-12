import { printHello } from "./util";

printHello();

importScar("cardinal.scar")
importScar("ScarUtil.scar")

importScar("gameplay/score.scar")
importScar("gameplay/diplomacy.scar")

importScar("winconditions/annihilation.scar")
importScar("winconditions/elimination.scar")
importScar("winconditions/surrender.scar")

importScar("gameplay/chi/current_dynasty_ui.scar")

const g = globalThis as any
g._mod = {
    module: "Mod",
    objective_title: "$275021965f3b48b9bd2c0d38d3e459aa:11",
    objective_requirement: 5,
    options: {},
    icons: {
        objective: "icons\\races\\common\\victory_conditions\\victory_condition_conquest",
    },
}
Core_RegisterModule(g._mod.module)

g.Mod_OnGameSetup = () => {
    Setup_GetWinConditionOptions(g._mod.options)

    if (g._mod.options.economy_section) {
        if (g._mod.options.economy_section.resource_amount.enum_value === g._mod.options.economy_section.resource_amount.enum_items.resource_200) {
            g._mod.resource_amount = 200
            print("OPTION SELECTED: 200 Resources per minute")
        } else if (g._mod.options.economy_section.resource_amount.enum_value === g._mod.options.economy_section.resource_amount.enum_items.resource_500) {
            g._mod.resource_amount = 500
            print("OPTION SELECTED: 500 Resources per minute")
        }
    }
}

g.Mod_PreInit = () => {
    Core_CallDelegateFunctions("TributeEnabled", true)
}

g.Mod_OnInit = () => {
    print("On mod init")

    g.localPlayer = Core_GetPlayersTableEntry(Game_GetLocalPlayer())

    findTownCenter()
    spawnBuilding()

    Rule_AddOneShot(g.Mod_SpawnUnits, 5)
    Rule_AddInterval(g.Mod_GiveResources, 60)
    Rule_AddGlobalEvent(g.Mod_OnConstructionComplete, GE.GE_ConstructionComplete)

    for (const player of g.PLAYERS) {
        Player_SetCurrentAge(player.id, 4)
        Player_SetResource(player.id, RT.RT_Food, 1000)
        Player_SetResource(player.id, RT.RT_Wood, 50)
        Player_SetResource(player.id, RT.RT_Gold, 0)
        Player_SetResource(player.id, RT.RT_Stone, 0)

        Player_SetMaxPopulation(player.id, CapType.CT_Personnel, 50)
    }

    Core_CallDelegateFunctions("DiplomacyEnabled", false)
    Core_CallDelegateFunctions("TributeEnabled", true)
}

g.Mod_Start = () => {
    setupObjective()
}

g.Mod_OnPlayerDefeated = (player: any, reason: any) => {

}

g.Mod_OnGameOver = () => {
    Rule_RemoveGlobalEvent(g.Mod_OnConstructionComplete)
}

function setupObjective() {
    if (g._mod.objective === undefined) {
        g._mod.objective = Obj_Create(g.localPlayer.id, g._mod.objective_title, Loc_Empty(), g._mod.icons.objective, "ConquestObjectiveTemplate", g.localPlayer.raceName, ObjectiveType.OT_Primary, 0, "conquestObj")

        Obj_SetState(g._mod.objective, ObjectiveState.OS_Incomplete)
        Obj_SetVisible(g._mod.objective, true)
        Obj_SetProgressVisible(g._mod.objective, true)
        Obj_SetCounterType(g._mod.objective, Counter.COUNTER_CountUpTo)
        Obj_SetCounterCount(g._mod.objective, 1)
        Obj_SetCounterMax(g._mod.objective, g._mod.objective_requirement)
        Obj_SetProgress(g._mod.objective, 1 / g._mod.objective_requirement)
    }
}

function findTownCenter() {
    for (const player of g.PLAYERS) {
        const egPlayerEntities = Player_GetEntities(player.id)
        EGroup_Filter(egPlayerEntities, "town_center", g.FILTER_KEEP)
        const entity = EGroup_GetEntityAt(egPlayerEntities, 1)
        const entityId = Entity_GetID(entity)
        const position = Entity_GetPosition(entity)

        player.town_center = {
            entity,
            entityId,
            position
        }

        FOW_RevealArea(player.town_center.position, 40, 30)
        Modifier_ApplyToEntity(
            Modifier_Create(ModifierApplicationType.MAT_Entity, "production_speed_modifier", ModifierUsageType.MUT_Multiplication, false, 20, null),
            player.town_center.entity, 0.0
        )
    }
}

g.Mod_SpawnUnits = () => {
    for (const player of g.PLAYERS) {
        const playerCiv = Player_GetRaceName(player.id)

        let sbpSpearman: SquadBlueprint
        switch (playerCiv) {
            case "english":
                sbpSpearman = BP_GetSquadBlueprint("unit_spearman_4_eng")
                break
            case "chinese":
                sbpSpearman = BP_GetSquadBlueprint("unit_spearman_4_chi")
                break
            case "french":
                sbpSpearman = BP_GetSquadBlueprint("unit_spearman_4_fre")
                break
            case "hre":
                sbpSpearman = BP_GetSquadBlueprint("unit_spearman_4_hre")
                break
            case "mongol":
                sbpSpearman = BP_GetSquadBlueprint("unit_spearman_4_mon")
                break
            case "rus":
                sbpSpearman = BP_GetSquadBlueprint("unit_spearman_4_rus")
                break
            case "sultanate":
                sbpSpearman = BP_GetSquadBlueprint("unit_spearman_4_sul")
                break
            case "abbasid":
                sbpSpearman = BP_GetSquadBlueprint("unit_spearman_4_abb")
                break
            default:
                throw Error()
        }

        const spawnPosition = Util_GetOffsetPosition(player.town_center.position, 20, 10)

        const sgroupName = `sg_player_spearmen_${player.id}`
        const sgPlayerSpearmen = SGroup_CreateIfNotFound(sgroupName)
        UnitEntry_DeploySquads(player.id, sgPlayerSpearmen, [{
            sbp: sbpSpearman, numSquads: 16
        }], spawnPosition)

        const movePosition = Util_GetOffsetPosition(player.town_center.position, 20, 20)
        Cmd_Ability(sgPlayerSpearmen, BP_GetAbilityBlueprint("core_formation_line"))
        Cmd_FormationMove(sgPlayerSpearmen, movePosition, false)
    }
}

function spawnBuilding() {
    for (const player of g.PLAYERS) {
        const playerCiv = Player_GetRaceName(player.id)

        let ebpBuilding: EntityBlueprint
        switch (playerCiv) {
            case "english":
                ebpBuilding = BP_GetEntityBlueprint("building_house_control_eng")
                break
            case "chinese":
                ebpBuilding = BP_GetEntityBlueprint("building_house_control_chi")
                break
            case "french":
                ebpBuilding = BP_GetEntityBlueprint("building_house_control_fre")
                break
            case "hre":
                ebpBuilding = BP_GetEntityBlueprint("building_house_control_hre")
                break
            case "mongol":
                ebpBuilding = BP_GetEntityBlueprint("building_house_mon")
                break
            case "rus":
                ebpBuilding = BP_GetEntityBlueprint("building_house_control_rus")
                break
            case "sultanate":
                ebpBuilding = BP_GetEntityBlueprint("building_house_control_sul")
                break
            case "abbasid":
                ebpBuilding = BP_GetEntityBlueprint("building_house_control_abb")
                break
            default:
                throw Error()
        }

        const spawnPosition = Util_GetOffsetPosition(player.town_center.position, 10, 20)

        const entity = Entity_Create(ebpBuilding, player.id, spawnPosition, false)
        Entity_Spawn(entity)
        Entity_ForceConstruct(entity)
        Entity_SnapToGridAndGround(entity, false)
    }
}

g.Mod_GiveResources = () => {
    for (const player of g.PLAYERS) {
        Player_AddResource(player.id, RT.RT_Food, g._mod.resource_amount)
        Player_AddResource(player.id, RT.RT_Wood, g._mod.resource_amount)
        Player_AddResource(player.id, RT.RT_Gold, g._mod.resource_amount)
        Player_AddResource(player.id, RT.RT_Stone, g._mod.resource_amount)

        if (player.isLocal) {
            const eventCueText = Loc_FormatText("$275021965f3b48b9bd2c0d38d3e459aa:12", g._mod.resource_amount)
            UI_CreateEventCueClickable(
                -1, 10, -1, 0, eventCueText, "", "low_priority", "",
                "sfx_ui_event_queue_low_priority_play", 255, 255, 255, 255,
                g.ECV_Queue, g.nothing
            )
        }
    }
}

g.Mod_OnConstructionComplete = (context: any) => {
    const builder = Core_GetPlayersTableEntry(context.player)

    if (builder !== undefined && !builder.isEliminated) {
        if (Entity_IsEBPOfType(context.pbg, "house")) {
            const objProgressCurrent = Obj_GetCounterCount(g._mod.objective)
            const objProgressNew = objProgressCurrent + 1;
            Obj_SetCounterCount(g._mod.objective, objProgressNew)
            Obj_SetProgress(g._mod.objective, objProgressNew / g._mod.objective_requirement)

            if (objProgressNew === g._mod.objective_requirement) {
                for (const player of g.PLAYERS) {
                    if (Player_ObserveRelationship(player.id, builder.id) === Relationship.R_ALLY) {
                        Core_SetPlayerVictorious(player.id, g.Mod_WinnerPresentation, WR.WR_CONQUEST)
                    } else {
                        Core_SetPlayerDefeated(player.id, g.Mod_LoserPresentation, WR.WR_CONQUEST)
                    }
                }
            }
        }
    } else {
        Sound_Play2D("mus_stinger_campaign_triumph_short")
    }
}

g.Mod_WinnerPresentation = (playerId: PlayerID) => {
    if (playerId == g.localPlayer.id) {
        Misc_ClearSelection()
        Taskbar_SetVisibility(false)
        Obj_SetState(g._mod.objective, ObjectiveState.OS_Complete)
        Obj_CreatePopup(g._mod.objective, g._mod.objective_title)
        Music_PlayStinger(g.MUS_STING_PRIMARY_OBJ_COMPLETE)
        Obj_SetVisible(g._mod.objective, false)

        Rule_AddOneShot(
            g._gameOver_message, g.GAMEOVER_OBJECTIVE_TIME,
            {
                _playerID: playerId,
                _icon: g._mod.icons.objective,
                _endType: Loc_GetString(11161277),
                _message: Loc_Empty(),
                _sound: "mus_stinger_landmark_objective_complete_success",
                _videoURI: "stinger_victory"
            }
        )

    }
}


g.Mod_LoserPresentation = (playerId: PlayerID) => {
    if (playerId == g.localPlayer.id) {
        Misc_ClearSelection()
        Taskbar_SetVisibility(false)
        Obj_SetState(g._mod.objective, ObjectiveState.OS_Failed)
        Obj_CreatePopup(g._mod.objective, g._mod.objective_title)
        Music_PlayStinger(g.MUS_STRING_PRIMARY_OBJ_FAIL)
        Obj_SetVisible(g._mod.objective, false)

        Rule_AddOneShot(
            g._gameOver_message, g.GAMEOVER_OBJECTIVE_TIME,
            {
                _playerID: playerId,
                _icon: g._mod.icons.objective,
                _endType: Loc_GetString(11045235),
                _message: Loc_Empty(),
                _sound: "mus_stinger_landmark_objective_complete_fail",
                _videoURI: "stinger_defeat"
            }
        )

    }
}