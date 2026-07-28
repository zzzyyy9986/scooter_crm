import L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BatteryIndicator } from '../../common/ui/BatteryIndicator';
import { STATUS_LABELS } from '../../common/ui/StatusBadge';
import type { Scooter, ScooterStatus } from '../../types/api';
import { DEFAULT_MAP_CENTER, SCOOTER_MARKER_COLORS } from './scooterMarkerColors';
import './ScooterMap.css';

interface ScooterMapProps {
  scooters: Scooter[];
  boundsKey: string;
}

/**
 * Подстраивает границы карты под текущий набор самокатов.
 * @param scooters - Отфильтрованные самокаты.
 * @param boundsKey - Ключ фильтров; пересчёт только при его смене.
 */
function FitBounds({ scooters, boundsKey }: ScooterMapProps) {
  const map = useMap();

  useEffect(() => {
    if (scooters.length === 0) {
      map.setView(DEFAULT_MAP_CENTER, 12);
      return;
    }

    const bounds = L.latLngBounds(
      scooters.map((scooter) => [scooter.latitude, scooter.longitude] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [boundsKey, map, scooters.length]);

  return null;
}

/**
 * Создаёт цветной маркер самоката по статусу.
 * @param status - Статус самоката.
 */
function createStatusIcon(status: ScooterStatus): L.DivIcon {
  const color = SCOOTER_MARKER_COLORS[status];

  return L.divIcon({
    className: 'scooter-marker',
    html: `<div class="scooter-marker__dot" style="background:${color}"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

/**
 * Карта самокатов с маркерами по координатам и popup с деталями.
 * @param scooters - Список самокатов для отображения.
 * @param boundsKey - Ключ фильтров для авто-подгонки границ.
 */
export function ScooterMap({ scooters, boundsKey }: ScooterMapProps) {
  return (
    <div>
      <div className="scooter-map shadow-sm">
        <MapContainer center={DEFAULT_MAP_CENTER} zoom={12} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds scooters={scooters} boundsKey={boundsKey} />
          {scooters.map((scooter) => (
            <Marker
              key={scooter.id}
              position={[scooter.latitude, scooter.longitude]}
              icon={createStatusIcon(scooter.status)}
            >
              <Popup>
                <div className="small">
                  <div className="fw-semibold mb-1">{scooter.number}</div>
                  <div className="text-muted mb-2">{scooter.model}</div>
                  <div className="mb-2">{STATUS_LABELS[scooter.status]}</div>
                  <BatteryIndicator level={scooter.battery_level} />
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="scooter-map-legend">
        {(Object.entries(SCOOTER_MARKER_COLORS) as [ScooterStatus, string][]).map(
          ([status, color]) => (
            <span key={status} className="scooter-map-legend__item">
              <span className="scooter-map-legend__dot" style={{ background: color }} />
              {STATUS_LABELS[status]}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
