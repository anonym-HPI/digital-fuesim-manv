import type { Feature } from 'ol';
import type { StyleLike } from 'ol/style/Style';

export abstract class StyleHelper<S extends StyleLike, T extends Feature> {
    private readonly styleCache = new Map<string, S>();

    /**
     * Generates the initial style for a feature.
     * Properties that will be changed in {@link adjustStyleToZoom} don't have to be set here.
     */
    protected abstract generateInitialStyle(feature: T, currentZoom: number): S;
    /**
     * The key that will be used to cache the initialStyle generated by {@link generateInitialStyle}.
     * You should never have the {@link currentZoom} directly in there.
     * Instead, use a threshold and save wether the zoom is higher or lower than the threshold.
     */
    protected abstract generateInitialStyleKey(
        feature: T,
        currentZoom: number
    ): string;
    /**
     * The {@link initialStyle} that was generated in {@link generateInitialStyle} for the {@link feature}
     * should be adjusted to the {@link currentZoom}.
     */
    protected abstract adjustStyleToZoom(
        initialStyle: S,
        currentZoom: number,
        feature: Feature
    ): S;

    /**
     * @example
     * ````
     *  layer.setStyle((thisFeature, currentZoom) =>
     *      this.lineStyleHelper.getStyle(thisFeature as Feature, currentZoom)
     *  );
     * ````
     */
    public getStyle(feature: T, zoom: number) {
        const key = this.generateInitialStyleKey(feature, zoom);
        if (!this.styleCache.has(key)) {
            this.styleCache.set(key, this.generateInitialStyle(feature, zoom));
        }
        const initialStyle = this.styleCache.get(key)!;
        return this.adjustStyleToZoom(initialStyle, zoom, feature);
    }
}