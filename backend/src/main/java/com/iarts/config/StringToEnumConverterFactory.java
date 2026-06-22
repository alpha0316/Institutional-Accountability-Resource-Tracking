package com.iarts.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.core.convert.converter.ConverterFactory;
import org.springframework.lang.NonNull;

import java.lang.reflect.Method;

/**
 * Lets @RequestParam/@PathVariable enums use the same lowercase wire format as JSON bodies
 * (which use each enum's @JsonCreator fromJson method) instead of Spring's default
 * case-sensitive Enum.valueOf.
 */
public class StringToEnumConverterFactory implements ConverterFactory<String, Enum<?>> {

    @Override
    @SuppressWarnings({"unchecked", "rawtypes"})
    public @NonNull <T extends Enum<?>> Converter<String, T> getConverter(@NonNull Class<T> targetType) {
        return new StringToEnumConverter(targetType);
    }

    private static class StringToEnumConverter<T extends Enum<T>> implements Converter<String, T> {
        private final Class<T> enumType;

        StringToEnumConverter(Class<T> enumType) {
            this.enumType = enumType;
        }

        @Override
        @SuppressWarnings("unchecked")
        public T convert(@NonNull String source) {
            try {
                Method fromJson = enumType.getMethod("fromJson", String.class);
                return (T) fromJson.invoke(null, source);
            } catch (NoSuchMethodException e) {
                return Enum.valueOf(enumType, source.toUpperCase());
            } catch (ReflectiveOperationException e) {
                throw new IllegalArgumentException("Cannot convert '" + source + "' to " + enumType.getSimpleName(), e);
            }
        }
    }
}
