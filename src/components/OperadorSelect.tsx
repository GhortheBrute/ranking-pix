'use client';

import React from 'react';
import { OperadorSimples } from '@/types';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

interface OperadorSelectProps {
    value: OperadorSimples | null;
    onChange: (value: OperadorSimples | null) => void;
    todosOperadores: OperadorSimples[];
    excluirIds?: number[]; // Lista de ids para esconder
}

export function OperadorSelect({ value, onChange, todosOperadores, excluirIds = [] }: OperadorSelectProps) {
    const [query, setQuery] = useState('');

    // Lógica de filtro interna
    const filteredOperadores = todosOperadores.filter(op => {
        // Remove os operadores que estão na lista de exclusão
        if (excluirIds.includes(op.matricula)) return false;

        // Filtra pelo texto
        return query === ''
            ? true
            : op.nome.toLowerCase().includes(query.toLowerCase());
    });

    return (
        <Combobox
            immediate
            value={value}
            onChange={onChange}
            onClose={() => setQuery('')} // Limpa a busca ao fechar
            
        >
            <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 sm:text-sm">
                <ComboboxInput
                    className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 outline-none"
                    displayValue={(op: OperadorSimples) => op?.nome}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Digite para buscar..."
                    autoComplete="off"
                />
                <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </ComboboxButton>
            </div>

            <ComboboxOptions
                anchor="bottom start"
                className="w-[var(--input-width)] [--anchor-gap:4px] max-h-60 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50"
            >
                {filteredOperadores.length === 0 && query !== '' ? (
                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                        Nenhum operador encontrado.
                    </div>
                ) : (
                    // Mantivemos o slice para performance
                    filteredOperadores.slice(0, 50).map((op) => (
                        <ComboboxOption
                            key={op.matricula}
                            className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-blue-600 text-white' : 'text-gray-900'
                                }`
                            }
                            value={op}
                        >
                            {({ selected, active }) => (
                                <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                        {op.nome}
                                    </span>
                                    <span className={`absolute inset-y-0 right-0 flex items-center pr-4 text-xs ${active ? 'text-blue-100' : 'text-gray-400'}`}>
                                        #{op.matricula}
                                    </span>
                                    {selected ? (
                                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-blue-600'}`}>
                                            <Check className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                    ) : null}
                                </>
                            )}
                        </ComboboxOption>
                    ))
                )}
            </ComboboxOptions>
        </Combobox>
    );
}