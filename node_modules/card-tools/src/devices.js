import { hass } from "./hass";

const areaData = hass().callWS({type: "config/area_registry/list"});
const deviceData = hass().callWS({type: "config/device_registry/list"});
const entityData = hass().callWS({type: "config/entity_registry/list"});

export async function getData(){
    window.cardToolsData = window.cardToolsData || {
        areas: await areaData,
        devices: await deviceData,
        entities: await entityData,
    }
    return window.cardToolsData;
}

getData();

export function areaByName(name) {
    const data = window.cardToolsData;
    for(const a of data.areas) {
        if(a.name.toLowerCase() === name.toLowerCase())
            return a;
    }
    return null;
}

export function areaDevices(area) {
    const data = window.cardToolsData;
    let devices = [];
    if(!area) return devices;
    for(const d of data.devices) {
        if(d.area_id === area.area_id) {
            devices.push(d);
        }
    }
    return devices;
}
export function deviceByName(name) {
    const data = window.cardToolsData;
    for(const d of data.devices) {
        if(d.name.toLowerCase() === name.toLowerCase())
            return d;
    }
    return null;
}
export function deviceEntities(device) {
    const data = window.cardToolsData;
    let entities = [];
    if(!device) return entities;
    for(const e of data.entities) {
        if(e.device_id === device.id) {
            entities.push(e.entity_id);
        }
    }
    return entities;
}
