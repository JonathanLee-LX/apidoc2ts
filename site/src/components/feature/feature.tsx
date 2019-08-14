import React, {PureComponent} from "react";
import ContentWrapper from "../content-wrapper/content-wrapper";
import "./feature.scss";

interface FeatureProps {
    image: string;
    description: string;
    imageOnLeft: boolean;
}

export default class Feature extends PureComponent<FeatureProps, {}> {
    render() {
        const modifier = this.props.imageOnLeft ? "" : "feature--image-on-right";
        return (
            <ContentWrapper>
                <div className={`feature ${modifier}`}>
                    <img className="feature__image"
                         src={this.props.image}
                         alt="feature example"/>
                    <span className="feature__description">{this.props.description}</span>
                </div>
            </ContentWrapper>
        );
    }
}
