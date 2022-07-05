import { VehicleTemplate } from '../../models';
import type { ImageProperties } from '../../models/utils';

const rtwImage: ImageProperties = {
    url: '/assets/rtw-vehicle.png',
    height: 100,
    aspectRatio: 3693 / 1670,
};

const ktwImage: ImageProperties = {
    url: '/assets/ktw-vehicle.png',
    height: 100,
    aspectRatio: 5046 / 2465,
};

const gwSanImage: ImageProperties = {
    url: '/assets/gwSan-vehicle.png',
    height: 120,
    aspectRatio: 5000 / 2474,
};

const nefImage: ImageProperties = {
    url: '/assets/nef-vehicle.png',
    height: 70,
    aspectRatio: 4455 / 1847,
};

const rthImage: ImageProperties = {
    url: '/assets/rth-vehicle.svg',
    height: 300,
    aspectRatio: 310 / 130,
};

const rtwVehicleTemplate = VehicleTemplate.create(
    'RTW',
    `RTW-???`,
    rtwImage,
    2,
    ['notSan', 'rettSan'],
    ['default']
);

const ktwVehicleTemplate = VehicleTemplate.create(
    'KTW',
    `KTW-???`,
    ktwImage,
    2,
    ['san', 'rettSan'],
    ['default']
);

// having one personnel type (and have 5 material)
const gwSanVehicleTemplate = VehicleTemplate.create(
    'GW-San',
    `GW-San-???`,
    gwSanImage,
    0,
    ['gf', 'rettSan', 'notSan', 'san', 'notarzt'],
    ['default', 'default', 'default', 'default', 'default']
);

const nefVehicleTemplate = VehicleTemplate.create(
    'NEF',
    `NEF-???`,
    nefImage,
    0,
    ['notarzt', 'notSan'],
    ['default']
);

const rthVehicleTemplate = VehicleTemplate.create(
    'RTH',
    `RTH-???`,
    rthImage,
    1,
    ['notarzt', 'notSan'],
    ['default']
);

export const defaultVehicleTemplates: readonly VehicleTemplate[] = [
    gwSanVehicleTemplate,
    rtwVehicleTemplate,
    ktwVehicleTemplate,
    nefVehicleTemplate,
    rthVehicleTemplate,
];
