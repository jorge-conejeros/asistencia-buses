// components/AlumnoItem.js
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import s from '../styles/alumnoItem';

/**
 * Fila compacta de alumno — todo en una sola línea horizontal:
 * [Nombre + curso] [✓ Presente] [✗ Ausente] [💬]
 *
 * Props:
 *   alumno   → { id, nombre, curso }
 *   estado   → { presente: bool|null, observacion: string }
 *   onChange → fn({ presente, observacion })
 */
export default function AlumnoItem({ alumno, estado, onChange }) {
  const [showObs, setShowObs] = useState(false);

  const togglePresente  = (valor) => onChange({ ...estado, presente: valor });
  const handleObsChange = (texto) => onChange({ ...estado, observacion: texto });

  const esPresente = estado.presente === true;
  const esAusente  = estado.presente === false;
  const tieneObs   = !!estado.observacion;

  return (
    <View style={[s.fila, esPresente && s.filaPresente, esAusente && s.filaAusente]}>
      {/* Indicador lateral de color */}
      <View style={[s.indicador, esPresente && s.indPresente, esAusente && s.indAusente]} />

      {/* Nombre y curso */}
      <View style={s.info}>
        <Text style={s.nombre} numberOfLines={1}>{alumno.nombre}</Text>
        <Text style={s.curso}>{alumno.curso}</Text>
      </View>

      {/* Botones compactos */}
      <View style={s.acciones}>
        <TouchableOpacity
          style={[s.btn, esPresente && s.btnPresente]}
          onPress={() => togglePresente(true)}
          activeOpacity={0.75}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          <Text style={[s.btnText, esPresente && s.btnTextPresente]}>✓</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.btn, esAusente && s.btnAusente]}
          onPress={() => togglePresente(false)}
          activeOpacity={0.75}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          <Text style={[s.btnText, esAusente && s.btnTextAusente]}>✗</Text>
        </TouchableOpacity>

        {/* Ícono de observación */}
        <TouchableOpacity
          style={[s.btnObs, tieneObs && s.btnObsActiva]}
          onPress={() => setShowObs(!showObs)}
          activeOpacity={0.75}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
        >
          <Text style={[s.btnObsText, tieneObs && s.btnObsTextActiva]}>
            {tieneObs ? '💬' : '○'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Campo de observación expandible (debajo de la fila) */}
      {showObs && (
        <TextInput
          style={s.obsInput}
          placeholder="Observación..."
          placeholderTextColor="#A0A6B8"
          value={estado.observacion}
          onChangeText={handleObsChange}
          multiline
          maxLength={200}
          autoFocus
        />
      )}
    </View>
  );
}