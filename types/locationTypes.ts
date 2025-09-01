import { Code } from "lucide-react";

export interface Comune {
    id: number;
    commune_name_ascii : string;
    commune_name: string;
    daira_name_ascii : string;
    daira_name: string;
    wilaya_code: string;
    wilaya_name_ascii: string;
    wilaya_name: string;
}
export interface Comunes {
    comunes: Comune[];
} 

export interface Wilaya {
    id: string;
    code: string;
    name: string;
    ar_name: string;
}

export interface Wilayas {
    wilayas: Wilaya[];
}
