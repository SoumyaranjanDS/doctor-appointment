import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { useJsApiLoader, Autocomplete, GoogleMap, Marker } from '@react-google-maps/api';

const libraries = ['places'];

const ClinicForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    phone: ''
  });
  const [document, setDocument] = useState(null);
  const [clinicLicense, setClinicLicense] = useState(null);
  const [adminIdProof, setAdminIdProof] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const autocompleteRef = React.useRef(null);
  const cityAutocompleteRef = React.useRef(null);
  const stateAutocompleteRef = React.useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onLoadAddress = (autoC) => { autocompleteRef.current = autoC; };
  const onLoadCity = (autoC) => { cityAutocompleteRef.current = autoC; };
  const onLoadState = (autoC) => { stateAutocompleteRef.current = autoC; };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (!place.geometry) return;

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setLocation({ lat, lng });

      let city = '', state = '', pinCode = '';
      if (place.address_components) {
        for (const component of place.address_components) {
          const componentType = component.types[0];
          switch (componentType) {
            case 'locality': city = component.long_name; break;
            case 'administrative_area_level_1': state = component.long_name; break;
            case 'postal_code': pinCode = component.long_name; break;
          }
        }
      }
      setFormData(prev => ({
        ...prev,
        address: place.name || place.formatted_address || '',
        city: city || prev.city,
        state: state || prev.state,
        pinCode: pinCode || prev.pinCode
      }));
    }
  };

  const onCityChanged = () => {
    if (cityAutocompleteRef.current !== null) {
      const place = cityAutocompleteRef.current.getPlace();
      if (place.name) setFormData(prev => ({ ...prev, city: place.name }));
    }
  };

  const onStateChanged = () => {
    if (stateAutocompleteRef.current !== null) {
      const place = stateAutocompleteRef.current.getPlace();
      if (place.name) setFormData(prev => ({ ...prev, state: place.name }));
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocation({ lat, lng });

          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const place = results[0];
              let city = '', state = '', pinCode = '';
              for (const component of place.address_components) {
                const componentType = component.types[0];
                switch (componentType) {
                  case 'locality': city = component.long_name; break;
                  case 'administrative_area_level_1': state = component.long_name; break;
                  case 'postal_code': pinCode = component.long_name; break;
                }
              }
              setFormData(prev => ({
                ...prev,
                address: place.formatted_address,
                city: city || prev.city,
                state: state || prev.state,
                pinCode: pinCode || prev.pinCode
              }));
            } else {
              setError('Could not fetch address for current location.');
            }
          });
        },
        () => setError('Location permission denied or unavailable.')
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Removed getToken
      
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      
      if (document) data.append('document', document);
      else throw new Error('Please upload a registration document');

      if (clinicLicense) data.append('clinicLicense', clinicLicense);
      else throw new Error('Please upload a clinic license');

      if (adminIdProof) data.append('adminIdProof', adminIdProof);
      else throw new Error('Please upload an admin ID proof');

      if (location.lat && location.lng) {
        data.append('lat', location.lat);
        data.append('lng', location.lng);
      }

      await api.post('/onboarding/clinic', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      navigate('/dashboard', { state: { message: 'Clinic application submitted successfully! Please wait for admin approval.' } });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8">
        <h1 className="text-headline-md font-headline-md text-on-surface mb-6">Clinic Registration</h1>
        
        {error && <div className="bg-error/10 text-error p-4 rounded-xl mb-6">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-2">Clinic Name</label>
            <input 
              type="text" name="name" required value={formData.name} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="City General Hospital"
            />
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-label-md font-label-md text-on-surface">Street Address</label>
              <button 
                type="button" 
                onClick={handleCurrentLocation}
                className="text-primary hover:bg-primary/10 px-2 py-1 rounded-md transition-colors flex items-center gap-1 text-label-sm font-label-md"
              >
                <span className="material-symbols-outlined text-[16px]">my_location</span>
                Use Current Location
              </button>
            </div>
            {isLoaded ? (
              <Autocomplete onLoad={onLoadAddress} onPlaceChanged={onPlaceChanged}>
                <input 
                  type="text" name="address" required value={formData.address} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Search for clinic location..."
                />
              </Autocomplete>
            ) : (
              <input 
                type="text" name="address" required value={formData.address} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            )}
          </div>

          {location.lat && location.lng && isLoaded && (
            <div className="w-full h-48 rounded-xl overflow-hidden shadow-sm border border-outline-variant">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={location}
                zoom={15}
                options={{ disableDefaultUI: true }}
              >
                <Marker position={location} />
              </GoogleMap>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-2">City</label>
              {isLoaded ? (
                <Autocomplete onLoad={onLoadCity} onPlaceChanged={onCityChanged} options={{ types: ['(cities)'] }}>
                  <input 
                    type="text" name="city" required value={formData.city} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </Autocomplete>
              ) : (
                <input 
                  type="text" name="city" required value={formData.city} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              )}
            </div>
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-2">State</label>
              {isLoaded ? (
                <Autocomplete onLoad={onLoadState} onPlaceChanged={onStateChanged} options={{ types: ['(regions)'] }}>
                  <input 
                    type="text" name="state" required value={formData.state} onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </Autocomplete>
              ) : (
                <input 
                  type="text" name="state" required value={formData.state} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-2">PIN Code</label>
              <input 
                type="text" name="pinCode" required value={formData.pinCode} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-2">Phone Number</label>
              <input 
                type="text" name="phone" required value={formData.phone} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-2">Clinic Registration Document</label>
            <input 
              type="file" accept="image/*,application/pdf" required onChange={(e) => setDocument(e.target.files[0])}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary"
            />
            <p className="text-body-sm text-on-surface-variant mt-1">Upload an official document verifying your clinic.</p>
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-2">Clinic License</label>
            <input 
              type="file" accept="image/*,application/pdf" required onChange={(e) => setClinicLicense(e.target.files[0])}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary"
            />
            <p className="text-body-sm text-on-surface-variant mt-1">Upload your clinic's operating license.</p>
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface mb-2">Admin ID Proof</label>
            <input 
              type="file" accept="image/*,application/pdf" required onChange={(e) => setAdminIdProof(e.target.files[0])}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-primary"
            />
            <p className="text-body-sm text-on-surface-variant mt-1">Upload a valid ID proof of the clinic administrator.</p>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-3 bg-secondary text-on-secondary rounded-full font-label-md hover:bg-secondary-container hover:text-on-secondary-container transition-colors disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Register Clinic'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ClinicForm;
