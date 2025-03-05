
module.exports = (sequelize, DataTypes) => {
    const Peers = sequelize.define("peers", {
        idx: { 
            type: DataTypes.INTEGER,
            primaryKey: true, 
            autoIncrement: true, 
        },
        address: { 
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: { 
            type: DataTypes.STRING,
            allowNull: false,
        }
    },{
        timestamps: true, 
        createdAt: true,
        updatedAt: false, 
        tableName:"peers",
        freezeTableName : true,
    });
    return Peers;
};