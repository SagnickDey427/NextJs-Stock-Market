import React from 'react'
import { Label } from '../ui/label'
import { Controller } from 'react-hook-form'
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"

import { COUNTRY_LIST } from "@/lib/constants"

function SearchableListField({ name, label, control, error, required }: CountrySelectProps) {
    return (
        <div className='space-y-2'>
            <Label htmlFor={name} className='form-label'>{label}</Label>
            <Controller
                name={name}
                control={control}
                rules={{
                    required: required ? `Please select ${label.toLowerCase()}` : false,
                }}
                render={({ field }) => (
                    <Combobox items={COUNTRY_LIST} value={field.value} onValueChange={field.onChange} itemToStringValue={(item) => item.label}>
                        <ComboboxInput placeholder="Select a country" className='select-trigger'/>
                        <ComboboxContent className='bg-gray-800 border-gray-600 text-white '>
                            <ComboboxEmpty>No items found.</ComboboxEmpty>
                            <ComboboxList >
                                {(item) => (
                                    <ComboboxItem key={item.value} value={item} className='focus:bg-gray-600 focus:text-white'>
                                        {item.label}
                                    </ComboboxItem>
                                )}
                            </ComboboxList>
                        </ComboboxContent>
                    </Combobox>
                )}
            />
            {error && <p className='text-red-500 text-sm'>{error.message}</p>}
        </div>
    )
}

export default SearchableListField